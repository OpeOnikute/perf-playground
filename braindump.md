On a basic Node server, when you make a request, these are the syscalls that are made:

```
root@2ef14f0d197b:/usr/src/app# strace -p `pgrep node`
strace: Process 1 attached
epoll_pwait(13, [{EPOLLIN, {u32=18, u64=18}}], 1024, -1, NULL, 8) = 1
accept4(18, NULL, NULL, SOCK_CLOEXEC|SOCK_NONBLOCK) = 19
accept4(18, NULL, NULL, SOCK_CLOEXEC|SOCK_NONBLOCK) = 20
accept4(18, NULL, NULL, SOCK_CLOEXEC|SOCK_NONBLOCK) = -1 EAGAIN (Resource temporarily unavailable)
epoll_ctl(13, EPOLL_CTL_ADD, 19, {EPOLLIN, {u32=19, u64=19}}) = 0
epoll_ctl(13, EPOLL_CTL_ADD, 20, {EPOLLIN, {u32=20, u64=20}}) = 0
epoll_pwait(13, [{EPOLLIN, {u32=20, u64=20}}], 1024, 0, NULL, 8) = 1
read(20, "GET / HTTP/1.1\r\nHost: localhost:"..., 65536) = 752
mprotect(0x3d042000, 249856, PROT_READ|PROT_WRITE) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_EXEC) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_WRITE) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_EXEC) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_WRITE) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_EXEC) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_WRITE) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_EXEC) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_WRITE) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_EXEC) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_WRITE) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_EXEC) = 0
openat(AT_FDCWD, "/etc/localtime", O_RDONLY|O_CLOEXEC) = 21
fstat(21, {st_mode=S_IFREG|0644, st_size=127, ...}) = 0
fstat(21, {st_mode=S_IFREG|0644, st_size=127, ...}) = 0
read(21, "TZif2\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\1\0\0\0\1\0\0\0\0"..., 4096) = 127
lseek(21, -71, SEEK_CUR)                = 56
read(21, "TZif2\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\1\0\0\0\1\0\0\0\0"..., 4096) = 71
close(21)                               = 0
readlinkat(AT_FDCWD, "/etc/localtime", "/usr/share/zoneinfo/Etc/UTC", 4095) = 27
write(20, "HTTP/1.1 304 Not Modified\r\nX-Pow"..., 178) = 178
epoll_ctl(13, EPOLL_CTL_MOD, 20, {EPOLLIN, {u32=20, u64=20}}) = 0
epoll_pwait(13, [], 1024, 0, NULL, 8)   = 0
epoll_pwait(13, [], 1024, 554, NULL, 8) = 0
epoll_pwait(13, [], 1024, 0, NULL, 8)   = 0
epoll_pwait(13, [{EPOLLIN, {u32=20, u64=20}}], 1024, 4436, NULL, 8) = 1
read(20, "GET / HTTP/1.1\r\nHost: localhost:"..., 65536) = 752
mprotect(0x3d042000, 249856, PROT_READ|PROT_WRITE) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_EXEC) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_WRITE) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_EXEC) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_WRITE) = 0
mprotect(0x3d042000, 249856, PROT_READ|PROT_EXEC) = 0
write(20, "HTTP/1.1 304 Not Modified\r\nX-Pow"..., 178) = 178
epoll_ctl(13, EPOLL_CTL_MOD, 20, {EPOLLIN, {u32=20, u64=20}}) = 0
epoll_pwait(13, [], 1024, 0, NULL, 8)   = 0
epoll_pwait(13, [], 1024, 582, NULL, 8) = 0
epoll_pwait(13, [], 1024, 0, NULL, 8)   = 0
epoll_pwait(13, [], 1024, 3440, NULL, 8) = 0
epoll_pwait(13, [], 1024, 0, NULL, 8)   = 0
epoll_pwait(13, [], 1024, 944, NULL, 8) = 0
epoll_ctl(13, EPOLL_CTL_DEL, 20, 0xffffd6afa940) = 0
close(20)                               = 0
epoll_pwait(13, [], 1024, 0, NULL, 8)   = 0
epoll_pwait(13, [], 1024, 0, NULL, 8)   = 0
epoll_pwait(13, 
```

Let's try to add a probe for one of the syscalls and get the status code?

The `write` syscll looks like where node sends the response, so let's probe that.

I was probing syscalls but what we need to look at for `perf probe -x` is library calls in userspace, so we need ltrace. But on my M1 (which is arch arm64), there's no ltrace package. Switching to another laptop to test this instead.

Attached ltrace to the Node process (`ltrace -p $(pgrep -n node) -o ltrace.out`) and got some output, but it didn't yield anything promising. Didn't find any actual Node function calls, mostly system calls:

```
6 __errno_location( <unfinished ...>
1 _ZdlPv(0x48b23e0, 40, 3, 0x7fffffb7 <unfinished ...>
6 <... __errno_location resumed> )                                                                                   = 0x9c7ca660
1 <... _ZdlPv resumed> )                                                                                             = 0x4933840
6 clock_gettime(6, 0x9c7c6d90, 0x9c7c6d90, 0xffffff60 <unfinished ...>
1 _ZdlPv(0x48035a0, 0x1039e1e00729, 0x1039e1e006e1, 0x1039e1e051b9 <unfinished ...>
6 <... clock_gettime resumed> )                                                                                      = 0
1 <... _ZdlPv resumed> )                                                                                             = 0x48b23d0
6 __errno_location( <unfinished ...>
1 free(0x4811950 <unfinished ...>
6 <... __errno_location resumed> )                                                                                   = 0x9c7ca660
1 <... free resumed> )                                                                                               = <void>
6 epoll_wait(9, 0x9c7c6e20, 1024, 0xffffffff <unfinished ...>
1 _ZdlPv(0x4800f50, 1096, 0x7f409cb64b58, 0x48b23d0)                                                                 = 1
1 free(0x4938770 <unfinished ...>
6 <... epoll_wait resumed> )                                                                                         = 0xffffffff
1 <... free resumed> )                                                                                               = <void>
6 __errno_location( <unfinished ...>
1 free(0x48f6f90 <unfinished ...>
6 <... __errno_location resumed> )                                                                                   = 0x9c7ca660
1 <... free resumed> )                                                                                               = <void>
6 clock_gettime(6, 0x9c7c6d90, 0x9c7c6d90, 0xffffff60 <unfinished ...>
1 _ZdlPv(0x47c4ff0, 64, 0x7f409cb64b58, 0x48f8f90 <unfinished ...>
6 <... clock_gettime resumed> )                                                                                      = 0
1 <... _ZdlPv resumed> )                                                                                             = 0x4829470
6 __errno_location( <unfinished ...>
1 clock_gettime(1, 0x7ffd26920520, 0xffffffff, 0x4829470 <unfinished ...>
6 <... __errno_location resumed> )                                                                                   = 0x9c7ca660
6 epoll_wait(9, 0x9c7c6e20, 1024, 0xffffffff <unfinished ...>
1 <... clock_gettime resumed> )                                                                                      = 0
1 pthread_mutex_lock(0x479bbe0, 0, 0x29a6b, 0x479dd90 <unfinished ...>
6 <... epoll_wait resumed> )                                                                                         = 0xffffffff
1 <... pthread_mutex_lock resumed> )                                                                                 = 0
6 __errno_location( <unfinished ...>
1 pthread_mutex_unlock(0x479bbe0, 0, 0, 1 <unfinished ...>
6 <... __errno_location resumed> )                                                                                   = 0x9c7ca660
1 <... pthread_mutex_unlock resumed> )                                                                               = 0
6 clock_gettime(6, 0x9c7c6d90, 0x9c7c6d90, 0xffffff60 <unfinished ...>
1 malloc(8192 <unfinished ...>
6 <... clock_gettime resumed> )                                                                                      = 0
1 <... malloc resumed> )                                                                                             = 0x48f6f90
6 __errno_location( <unfinished ...>
1 free(0x48f6f90 <unfinished ...>
6 <... __errno_location resumed> )                                                                                   = 0x9c7ca660
1 <... free resumed> )                                                                                               = <void>
6 epoll_wait(9, 0x9c7c6e20, 1024, 0xffffffff <unfinished ...>
1 pthread_mutex_lock(0x479bbe0, 0x7ffd26920510, 255, 0)                                                              = 0
1 pthread_mutex_unlock(0x479bbe0, 0, 0, 1 <unfinished ...>
6 <... epoll_wait resumed> )                                                                                         = 0xffffffff
1 <... pthread_mutex_unlock resumed> )                                                                               = 0
6 __errno_location( <unfinished ...>
1 clock_gettime(1, 0x7ffd26920420, 0x479bbe0, 1 <unfinished ...>
6 <... __errno_location resumed> )                                                                                   = 0x9c7ca660
6 clock_gettime(6, 0x9c7c6d90, 0x9c7c6d90, 0xffffff60)                                                               = 0
1 <... clock_gettime resumed> )                                                                                      = 0
6 __errno_location( <unfinished ...>
1 _Znwm(64, 0x4791850, 0x5f00de00c8, 512 <unfinished ...>
6 <... __errno_location resumed> )                                                                                   = 0x9c7ca660
1 <... _Znwm resumed> )                                                                                              = 0x47b5f20
6 epoll_wait(9, 0x9c7c6e20, 1024, 0xffffffff <unfinished ...>
1 _Znwm(1104, 0x36493cb22c79, 0, 0x49ea)                                                                             = 0x4803150
1 _Znwm(1096, 0x7ffd269205a0, 0x4803150, 0x1f119482806a00e0 <unfinished ...>
6 <... epoll_wait resumed> )                                                                                         = 0xffffffff
1 <... _Znwm resumed> )                                                                                              = 0x4800f50
6 __errno_location( <unfinished ...>
1 malloc(1536 <unfinished ...>
6 <... __errno_location resumed> )                                                                                   = 0x9c7ca660
1 <... malloc resumed> )                                                                                             = 0x48d5720
6 clock_gettime(6, 0x9c7c6d90, 0x9c7c6d90, 0xffffff60 <unfinished ...>
1 memcpy(0x48d5720, "\210@\204\004\0\0\0\0\001\0\0\0\0\0\0\0{\354\3545\0\0\0\0\250@\204\004\0\0\0\0"..., 1536 <unfinished ...>
6 <... clock_gettime resumed> )                                                                                      = 0
1 <... memcpy resumed> )                                                                                             = 0x48d5720
6 __errno_location( <unfinished ...>
1 malloc(8192 <unfinished ...>
6 <... __errno_location resumed> )                                                                                   = 0x9c7ca660
1 <... malloc resumed> )                                                                                             = 0x48f6f90
6 epoll_wait(9, 0x9c7c6e20, 1024, 0xffffffff <unfinished ...>
1 _Znwm(256, 0x30ffffffff, 0x36ffffffff, 0x48f6fd8)                                                                  = 0x491f8d0
1 _Znwm(512, 0, 0x491f8d0, 0x7f409cb64b00 <unfinished ...>
6 <... epoll_wait resumed> )                                                                                         = 0xffffffff
1 <... _Znwm resumed> )                                                                                              = 0x478af30
6 __errno_location( <unfinished ...>
1 malloc(3072 <unfinished ...>
6 <... __errno_location resumed> )                                                                                   = 0x9c7ca660
1 <... malloc resumed> )                                                                                             = 0x4811950
```

Attaching ltrace slowed down the Node process considerably. That's something to note.

It doesn't look like NodeJS exposes tracepoints in the way that nginx does https://github.com/nodejs/diagnostics/issues/386. Need to look deeper into what Node exposes and why it's different from Nginx.

Good place to start would be the Node tracing library mentioned in that issue.