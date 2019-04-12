/**
 * CopyRight @ 2019 壹彤财富All Rights Reserved
 */
package com.ytcf.msa.framework.registry.scanbase.base.listener;

import com.ytcf.msa.framework.registry.scanbase.util.zookeeper.ServiceRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import java.util.Map;

/**
 * @Description: 这里用一句话描述这个类的作用
 * @see: AutoReplyDao 此处填写需要参考的类
 * @version 2019年04月01日 21:21:08
 * @author LiuQuan
 */
@Component
public class WebListener implements ServletContextListener {
    @Value("${containers.servers.address}")
    private String serverAddress;

    @Value("${containers.servers.port}")
    private  int serverPort;

    @Autowired
    private ServiceRegistry serviceRegistry;

    public void contextInitialized(ServletContextEvent event) {

        //获取请求映射
        ServletContext servletContext=event.getServletContext();
        WebApplicationContext applicationContext= WebApplicationContextUtils.getRequiredWebApplicationContext(servletContext);
        RequestMappingHandlerMapping mapping=applicationContext.getBean(RequestMappingHandlerMapping.class);
        Map<RequestMappingInfo, HandlerMethod> infoMap=mapping.getHandlerMethods();
        for (RequestMappingInfo info:infoMap.keySet()){
            String serviceName=info.getName();
            if(serviceName!=null){
                //注册服务
                serviceRegistry.register(serviceName,String.format("%s:%d",serverAddress,serverPort));
            }
        }
    }

    public void contextDestroyed(ServletContextEvent event) {
    }

}
