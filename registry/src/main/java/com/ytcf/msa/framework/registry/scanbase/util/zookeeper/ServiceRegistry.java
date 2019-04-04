package com.ytcf.msa.framework.registry.scanbase.util.zookeeper;

/**
 * 服务注册表
 */
public interface ServiceRegistry {
    /**
     *
     * @param serviceName 服务名称
     * @param serviceAddress 服务地址
     */
    void  register(String serviceName, String serviceAddress);
}
