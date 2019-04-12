FROM java:8
MAINTAINER "Liu Quan"<liuquan@yitongxiaofei.cn>
#ADD @project.build.finalName@.jar app.jar
ADD  webserver-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081

# alpine 下修改UTC时间为CST时间 (测试通过)

ENV TZ=Asia/Shanghai

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

ENTRYPOINT ["java","-Djava.security.egd=file:/dev/./urandom","-jar","/app.jar"]