package com.ytcf.msa.framework.registry.scanbase.util.zookeeper.impl; /**
 * CopyRight @ 2019 壹彤财富All Rights Reserved
 */




import com.ytcf.msa.framework.registry.scanbase.util.zookeeper.ServiceRegistry;
import org.apache.zookeeper.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import java.util.concurrent.CountDownLatch;

/**
 * @Description: 这里用一句话描述这个类的作用
 * @see: AutoReplyDao 此处填写需要参考的类
 * @version 2019年04月01日 16:16:39
 * @author LiuQuan
 */
@Component
public class ServiceRegistryImpl implements ServiceRegistry,Watcher {
    private static Logger logger= LoggerFactory.getLogger(ServiceRegistryImpl.class);
    private static CountDownLatch latch=new CountDownLatch(1);
    private static  final int SESSION_TIMEOUT=500;
    private static  final String REGISTRY_PATH="/registry";

    private ZooKeeper zk;
    public ServiceRegistryImpl(){};

    public ServiceRegistryImpl(String zkServers){
        try {
            //创建Zookeeper 客户端
            zk=new ZooKeeper(zkServers,SESSION_TIMEOUT,this);
            latch.await();
            logger.error("connected to zookeeper");
        }catch(Exception e){
            logger.error("create zookeeper client failure",e);
        }
    };

    @Override
    public void register(String serviceName, String serviceAddress) {
        try {
            //创建根节点（持久节点）
            String registryPath=REGISTRY_PATH;
            if(zk.exists(registryPath,false)==null){
                zk.create(registryPath,null, ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);
                logger.error("create registry node:{}",registryPath);
            }
            //创建服务节点（持久节点）
            String servicePath=registryPath+ "/"+serviceName;
            if(zk.exists(servicePath,false)==null){
                zk.create(servicePath,null,ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);
                logger.error("create service node:{}",registryPath);
            }
            //创建地址节点（临时顺序节点）
            String addressPath=servicePath+"/address-";
            String addressNode=zk.create(addressPath,serviceAddress.getBytes(),ZooDefs.Ids.OPEN_ACL_UNSAFE,CreateMode.EPHEMERAL_SEQUENTIAL);
            logger.error("create address node:{}=>{}",addressNode);

        }catch (Exception e){
            logger.error("create node failure",e);
        }
    }

    @Override
    public void process(WatchedEvent watchedEvent) {
        if(watchedEvent.getState()==Event.KeeperState.SyncConnected){
            latch.countDown();
        }
    }
}
