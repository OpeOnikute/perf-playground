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

