/**
 * CopyRight @ 2019 壹彤财富All Rights Reserved
 */
package com.ytcf.msa.framework.registry.scanbase.base.config;



import com.ytcf.msa.framework.registry.scanbase.util.zookeeper.ServiceRegistry;
import com.ytcf.msa.framework.registry.scanbase.util.zookeeper.impl.ServiceRegistryImpl;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * @Description: 这里用一句话描述这个类的作用
 * @see: AutoReplyDao 此处填写需要参考的类
 * @version 2019年04月01日 19:19:02
 * @author LiuQuan
 */

@Configuration
@ConfigurationProperties(prefix = "registry")
public class RegistryConfig {
    private String servers;
    @Bean
    public ServiceRegistry serviceRegistry(){
        return new ServiceRegistryImpl(servers);
    }

    public void setServers(String servers){
        this.servers=servers;
    }
}
