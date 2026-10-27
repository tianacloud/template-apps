(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SceneOne = Object.assign(root.SceneOne || {}, api);
})(typeof self !== 'undefined' ? self : globalThis, function () {
  'use strict';

  const SAMPLES = [
    {
      id: 'ci-node',
      name: 'Node CI 构建失败',
      desc: 'GitHub Actions：依赖解析冲突 + 单测失败，第一现场是 ERESOLVE，后面全是级联',
      text: `build	Set up job	2026-10-21T09:12:01.1000000Z Current runner version: '2.328.0'
build	Set up job	2026-10-21T09:12:01.3000000Z Runner name: 'GitHub Actions 4'
build	Set up job	2026-10-21T09:12:02.0000000Z Operating System: Ubuntu 24.04
build	Set up node	2026-10-21T09:12:03.1000000Z Successfully extracted Node.js 20.18.0
build	Install dependencies	2026-10-21T09:12:04.2000000Z ##[group]Run npm ci
build	Install dependencies	2026-10-21T09:12:05.8000000Z npm warn deprecated inflight@1.0.6: This module is not supported
build	Install dependencies	2026-10-21T09:12:07.1000000Z npm error code ERESOLVE
build	Install dependencies	2026-10-21T09:12:07.1500000Z npm error ERESOLVE could not resolve
build	Install dependencies	2026-10-21T09:12:07.2000000Z npm error While resolving: react-dom@18.3.1
build	Install dependencies	2026-10-21T09:12:07.2500000Z npm error Found: react@18.2.0
build	Install dependencies	2026-10-21T09:12:07.3000000Z npm error   react@"18.2.0" from the root project
build	Install dependencies	2026-10-21T09:12:07.4000000Z npm error Could not resolve dependency:
build	Install dependencies	2026-10-21T09:12:07.4500000Z npm error peer react@"^18.3.0" from @mui/material@5.15.0
build	Install dependencies	2026-10-21T09:12:07.5000000Z npm error   node_modules/@mui/material
build	Install dependencies	2026-10-21T09:12:07.5500000Z npm error     @mui/material@"5.15.0" from the root project
build	Install dependencies	2026-10-21T09:12:07.7000000Z npm error Fix the upstream dependency conflict, or retry
build	Install dependencies	2026-10-21T09:12:07.8000000Z npm error this command with --force or --legacy-peer-deps
build	Install dependencies	2026-10-21T09:12:07.9000000Z npm error A complete log of this run can be found in: /home/runner/.npm/_logs/2026-10-21T09_12_07_812Z-debug-0.log
build	Install dependencies	2026-10-21T09:12:08.1000000Z ##[error]Process completed with exit code 1.
build	Run tests	2026-10-21T09:12:09.0000000Z ##[group]Run npm test -- --coverage
build	Run tests	2026-10-21T09:12:09.5000000Z npm error MODULE_NOT_FOUND
build	Run tests	2026-10-21T09:12:09.5500000Z Cannot find module 'react-dom/client' from '<rootDir>/src/main.js'
build	Run tests	2026-10-21T09:12:10.1000000Z FAIL src/utils/format.test.js
build	Run tests	2026-10-21T09:12:10.2000000Z   ● formatCurrency › rounds to 2 decimals
build	Run tests	2026-10-21T09:12:10.2500000Z     expect(received).toBe(expected) // Object.is equality
build	Run tests	2026-10-21T09:12:10.3000000Z     Expected: "1,234.57"
build	Run tests	2026-10-21T09:12:10.3500000Z     Received: "1,234.6"
build	Run tests	2026-10-21T09:12:10.4000000Z     > 13 |     expect(formatCurrency(1234.567)).toBe('1,234.57');
build	Run tests	2026-10-21T09:12:11.0000000Z Test Suites: 1 failed, 6 passed, 7 total
build	Run tests	2026-10-21T09:12:11.1000000Z ##[error]Process completed with exit code 1.
build	Post job cleanup	2026-10-21T09:12:12.0000000Z Cleaning up orphan processes`
    },
    {
      id: 'py-service',
      name: 'Python 服务报错',
      desc: 'FastAPI 下单接口 500：数据库连接被拒绝引发连锁异常',
      text: `2026-10-21 14:02:09,118 INFO uvicorn.error Application startup complete
2026-10-21 14:02:10,442 INFO sqlalchemy.engine.Engine BEGIN (implicit)
2026-10-21 14:02:10,905 INFO uvicorn.access 127.0.0.1:52314 - "POST /api/orders HTTP/1.1" 500
2026-10-21 14:02:10,908 ERROR app.orders Failed to create order
Traceback (most recent call last):
  File "/srv/app/orders/service.py", line 87, in create_order
    result = db.session.execute(stmt)
  File "/srv/app/venv/lib/python3.12/site-packages/sqlalchemy/orm/session.py", line 1717, in execute
    return self._execute_internal(stmt)
  File "/srv/app/venv/lib/python3.12/site-packages/sqlalchemy/engine/base.py", line 1969, in _execute_internal
    conn = self._connection_for_bind(engine, ...
psycopg2.OperationalError: connection to server at "10.20.30.40", port 5432 failed: Connection refused
	Is the server running on that host and accepting TCP/IP connections?
During handling of the above exception, another exception occurred:
Traceback (most recent call last):
  File "/srv/app/main.py", line 142, in create_order_endpoint
    order = create_order(payload)
  File "/srv/app/orders/service.py", line 91, in create_order
    raise OrderCreateError("upstream inventory service unreachable")
app.exceptions.OrderCreateError: upstream inventory service unreachable
2026-10-21 14:02:11,010 WARNING app.retry inventory sync retrying in 2s (attempt 1/3)
2026-10-21 14:02:13,502 WARNING app.retry inventory sync retrying in 2s (attempt 2/3)
2026-10-21 14:02:15,998 WARNING app.retry inventory sync retrying in 2s (attempt 3/3)
2026-10-21 14:02:16,001 ERROR app.retry inventory sync failed after 3 attempts
2026-10-21 14:02:16,015 INFO uvicorn.access 127.0.0.1:52316 - "GET /healthz HTTP/1.1" 200
2026-10-21 14:02:18,220 ERROR app.orders Failed to create order
Traceback (most recent call last):
  File "/srv/app/orders/service.py", line 87, in create_order
    result = db.session.execute(stmt)
  File "/srv/app/venv/lib/python3.12/site-packages/sqlalchemy/engine/base.py", line 1969, in _execute_internal
    conn = self._connection_for_bind(engine, ...
psycopg2.OperationalError: connection to server at "10.20.30.40", port 5432 failed: Connection refused
	Is the server running on that host and accepting TCP/IP connections?
2026-10-21 14:02:18,240 ERROR app.orders Failed to create order
Traceback (most recent call last):
  File "/srv/app/orders/service.py", line 52, in load_cart
    sku = inventory[payload["sku_id"]]
KeyError: 'sku_10241'
2026-10-21 14:02:20,004 INFO uvicorn.access 127.0.0.1:52318 - "GET /healthz HTTP/1.1" 200`
    },
    {
      id: 'java-oom',
      name: 'Java 服务 OOM',
      desc: 'Spring Boot 批任务触发堆溢出，级联任务失败与连接池超时',
      text: `2026-10-21T03:14:02.118Z INFO  [main] com.example.OrderService - Application started in 8.42 seconds (JVM running for 9.61)
2026-10-21T03:14:31.002Z WARN  [http-nio-8080-exec-7] c.e.i.SlowRequestInterceptor - slow request 2140ms GET /api/v1/report
2026-10-21T03:14:58.341Z INFO  [scheduling-1] c.e.batch.ReportJob - nightly report export started, rows=0
2026-10-21T03:15:02.441Z ERROR [scheduling-1] c.e.batch.ReportJob - batch export failed
java.lang.OutOfMemoryError: Java heap space
	at java.base/java.util.Arrays.copyOf(Arrays.java:3539)
	at java.base/java.util.ArrayList.grow(ArrayList.java:242)
	at java.base/java.util.ArrayList.ensureCapacity(ArrayList.java:238)
	at java.base/java.util.ArrayList.add(ArrayList.java:468)
	at com.example.batch.ReportCollector.add(ReportCollector.java:64)
	at com.example.batch.ReportJob.run(ReportJob.java:118)
2026-10-21T03:15:02.443Z ERROR [scheduling-1] c.e.batch.ReportJob - job failed after 1 attempts
com.example.batch.JobFailedException: report generation exceeded memory budget
	at com.example.batch.ReportJob.run(ReportJob.java:126)
Caused by: java.lang.OutOfMemoryError: Java heap space
	at java.base/java.util.Arrays.copyOf(Arrays.java:3539)
2026-10-21T03:15:02.500Z WARN  [scheduling-1] c.e.metrics.MetricsReporter - heap used=3.9g max=4.0g
2026-10-21T03:15:07.900Z ERROR [http-nio-8080-exec-19] c.e.api.ReportController - request failed
org.springframework.web.server.ResponseStatusException: 500 Internal Server Error
	at com.example.api.ReportController.export(ReportController.java:77)
2026-10-21T03:15:12.120Z ERROR [http-nio-8080-exec-22] c.e.db.HikariProbe - connection acquisition failed
com.zaxxer.hikari.pool.HikariPool$PoolInitializationException: Pool starts up with 0 connections
	at com.zaxxer.hikari.pool.HikariPool.checkFailFast(HikariPool.java:565)
Caused by: java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms
	at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:187)
2026-10-21T03:15:20.000Z WARN  [scheduling-1] c.e.batch.ReportJob - scheduler will retry job at 03:20:00
2026-10-21T03:15:40.000Z INFO  [ionShutdownHook] o.s.b.w.e.tomcat.GracefulShutdown - Commencing graceful shutdown`
    },
    {
      id: 'nginx-docker',
      name: 'Nginx + 容器混合日志',
      desc: '502 风暴溯源：上游端口拒绝连接，叠加磁盘满与容器 OOMKilled',
      text: `10.20.0.15 - - [21/Oct/2026:16:30:01 +0800] "GET /api/health HTTP/1.1" 200 12 "-" "kube-probe/1.29"
10.20.0.15 - - [21/Oct/2026:16:30:04 +0800] "GET /api/orders?page=2 HTTP/1.1" 502 157 "-" "Mozilla/5.0 (X11; Linux x86_64)"
2026/10/21 16:30:04 [error] 31#31: *9042 connect() failed (111: Connection refused) while connecting to upstream, client: 10.20.0.15, server: api.internal.example.com, request: "GET /api/orders?page=2 HTTP/1.1", upstream: "http://127.0.0.1:8081/api/orders?page=2", host: "api.internal.example.com"
10.20.0.33 - - [21/Oct/2026:16:30:06 +0800] "POST /api/orders HTTP/1.1" 502 157 "-" "axios/1.7.7"
2026/10/21 16:30:06 [error] 31#31: *9045 connect() failed (111: Connection refused) while connecting to upstream, client: 10.20.0.33, server: api.internal.example.com, request: "POST /api/orders HTTP/1.1", upstream: "http://127.0.0.1:8081/api/orders", host: "api.internal.example.com"
10.20.0.15 - - [21/Oct/2026:16:30:09 +0800] "GET /api/orders?page=3 HTTP/1.1" 502 157 "-" "Mozilla/5.0 (X11; Linux x86_64)"
2026/10/21 16:30:09 [error] 31#31: *9047 connect() failed (111: Connection refused) while connecting to upstream, client: 10.20.0.15, server: api.internal.example.com, request: "GET /api/orders?page=3 HTTP/1.1", upstream: "http://127.0.0.1:8081/api/orders?page=3", host: "api.internal.example.com"
10.20.0.15 - - [21/Oct/2026:16:30:12 +0800] "GET /api/orders?page=4 HTTP/1.1" 502 157 "-" "Mozilla/5.0 (X11; Linux x86_64)"
2026/10/21 16:30:12 [error] 31#31: *9051 connect() failed (111: Connection refused) while connecting to upstream, client: 10.20.0.15, server: api.internal.example.com, request: "GET /api/orders?page=4 HTTP/1.1", upstream: "http://127.0.0.1:8081/api/orders?page=4", host: "api.internal.example.com"
2026/10/21 16:30:18 [crit] 31#31: *9055 SSL_do_handshake() failed (SSL: error:14094415:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:SSL alert number 80) while SSL handshaking, client: 203.0.113.66, server: 0.0.0.0:443
2026/10/21 16:30:40 [emerg] 31#31: *9060 open() "/var/log/nginx/access.log.1" failed (28: No space left on device)
Oct 21 16:31:02 node-3 dockerd[842]: level=error msg="container api-server OOMKilled"
Oct 21 16:31:02 node-3 containerd[811]: container 7f3a91c2 exited with code 137
Oct 21 16:31:05 node-3 kubelet[790]: Container image already present on machine
Oct 21 16:31:09 node-3 kubelet[790]: Created container api-server
Oct 21 16:31:10 node-3 kubelet[790]: Started container api-server`
    }
  ];

  function getSample(id) {
    for (const s of SAMPLES) if (s.id === id) return s;
    return null;
  }

  return { SAMPLES: SAMPLES, getSample: getSample };
});
