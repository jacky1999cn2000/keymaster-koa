# keymaster-koa

这个项目基本和keymaster(sailsjs)一样,只记录一下稍微不同的东西.

### docker-compose variable substitution
最终这个项目里没有用,但是说一下用法

*docker-compose.yml* 比如在这个文件中可以引用一个env variable ${TASK}
```javascript
key-master:
  build: .
  links:
   - dynamodb
  ports:
    - "3000:3000"
  environment:
    TASK: ${TASK}
  volumes:
    - .:/usr/src/app/
  entrypoint: "/usr/src/app/run-local.sh"
dynamodb:
  image: fitz/dynamodb-local
  ports:
  - "8000:8000"
  command: fitz/dynamodb-local -sharedDb
```

*run-local.sh* 里可以根据$TASK的值来做不同的事情
```javascript
#!/bin/bash
set -e

if [ "$TASK" = 'TEST' ]; then
  echo "unit test"
  exec /usr/src/app/node_modules/mocha/bin/_mocha test/bootstrap.test.js test/unit/**/*.test.js
else
  echo "development"
  exec /usr/src/app/node_modules/nodemon/bin/nodemon.js -L --ignore node_modules/ --ignore public/ --ignore .tmp/ /usr/src/app/app.js
fi
```

最关键的是docker-compose.yml里面${TASK}这个env variable在哪里定义的:

1. 直接在命令行里面 `TASK=DEV docker-compose up` (env variable仅仅对当前process有效)
2. 在Makefile里面
```javascript
  make test
    TASK=DEV docker-compose up
```

[文档](https://github.com/docker/compose/blob/ea8cc1c3dc47c9ed3bff56c5a8d99175b57af650/docs/compose-file.md#variable-substitution)

### overwrite image entrypoint
比如这个例子里默认的Dockerfile entrypoint是`/usr/src/app/node_modules/.bin/forever app.js --prod`,那么可以在Makefile(或者直接在命令行里)写下面的语句来覆盖entrypoint

```javascript
test: build_image
	docker run -it --rm --entrypoint=/usr/src/app/run-test.sh ${IMAGE}:${GIT_HASH}
```
or

```javascript
docker build -t myimage .
docker run -it --rm --entrypoint=/usr/src/app/run-test.sh myimage:latest
```

相关的 *run-local.sh*
```javascript
#!/bin/bash
echo "unit test"
exec /usr/src/app/node_modules/mocha/bin/_mocha tests/**/*.test.js -R spec
```

### unit test

把AWS相关的东西放在./services/AWS.js里面是为了便于sinon.stub来替代,具体见代码

### Koa.js

Koa简单的来说就是express+generator.

下面这个例子里,每个middleware先按照顺序被调用,当碰到`yield next`的时候，则停下来当前的middleware去执行下一个middleware,等下一个middleware执行完了之后再返回.

所以这里xResponseTime中断自己然后调用consoleLogger,consoleLogger又中断自己调用最后一个middleware,然后返回consoleLogger,完成后返回xResponseTime.最后记录下来的时间consoleLogger可能花了2ms,xResponseTime可能花了5ms.

```javascript
var koa = require('koa');
var app = koa();

app.use(function *xResponseTime(next){
  var start = new Date;
  yield next;

  var ms = new Date - start;
  this.set('X-Response-Time', ms + ' ms');
});

app.use(function *consoleLogger(next){
  var start = new Date;
  yield next;

  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(3000);
```

### Makefile Update

这个修改过的Makefile比目前项目中的更简洁:

1. install step里install的内容通过volumes在build_image或run step里存在
2. test step可以直接搞个-it模式的node:5 container直接run test,同样,因为之前有build_image step,所以所有需要的东西都通过volumes的保存而存在了

```javascript
IMAGE=bunchballdev/keymaster
GIT_HASH=$(shell git rev-parse --short HEAD)

default: tag

clean:
	echo "clean"

prep:
	docker pull bunchballdev/node:5

install: clean
	docker run -it --rm --name install -v `pwd`:/usr/src/app -w /usr/src/app node:5 npm install

build_image: install
	docker build --no-cache -t $(IMAGE):$(GIT_HASH) .

test: build_image
	docker run -it --rm --name install -v `pwd`:/usr/src/app -w /usr/src/app node:5 /usr/src/app/node_modules/mocha/bin/_mocha tests/**/*.test.js -R spec

tag: test
	docker tag -f $(IMAGE):$(GIT_HASH) $(IMAGE):latest

version:
	git log -n 1 >> BUILD-VERSION.txt

push: test version tag
	docker push $(IMAGE):$(GIT_HASH)
	docker push $(IMAGE):latest

run: install
	docker-compose down
	docker-compose up
```
