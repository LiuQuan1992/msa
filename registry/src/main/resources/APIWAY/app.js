/**
 * CopyRight © 2019 壹彤财富_科技部 All Rights Reserved
 */


/**
 * @Description: 微服务架构 网关 node.js+express+zookeeper
 * 				 express:虚拟服务器模块
 * 				 node-zookeeper-client:zokeeper 客户端模块
 * 				 http-proxy:http代理模块？https-proxy?
 * 				 http:http模块
 * 				 hashmap:hashmap数据结构模块
 *      优化方案 
 *      1)Zookeeper 采用集群方式
 *      2)对服务发现的目标地址进行缓存
 *      3)CPU多核模式-实现高可用性
 *
 * 注意：暂时 前端资源请求 默认定位到 8080
 * @version 2019年4月1日 上午10:01:53 
 * @author LiuQuan
 */


/*
*引入各个模块
* npm install * -save
* 如 npm install express -save
* npm模块会自动下载相关模块，并为当前项目匹配->package.json 配置文件
*/
var express=require('express');
var zookeeper=require('node-zookeeper-client');
var httpProxy=require('http-proxy');
var http=require('http');
var hashmap=require('hashmap');
var cache=new hashmap();//存储服务节点
var cacheAddress=new hashmap();//存储服务节点


/*
 * @parm PORT 				   --PORT   当前网关运行的 端口 
 * @parm CONNECTION_STRING     --ZooKeeper 服务 的集群 地址:端口
 * @parm REGISTRY_PORT_SERVER  --后端项目 根节点
 * @parm REGISTRY_PORT_WEB     --前端项目 根节点
 */
var PORT=1234;
var CONNECTION_STRING='127.0.0.1:2181,127.0.0.1:2182,127.0.0.1:2183';
var REGISTRY_PORT_SERVER='/registry';//项目根目录-后端服务跟目录
var REGISTRY_PORT_WEB='/web';//


//连接 ZooKeeper
var zk=zookeeper.createClient(CONNECTION_STRING);
zk.connect();

//创建代理服务器对象并监听错误事件
var proxy=httpProxy.createProxyServer();

proxy.on('error',function(err,req,res){
	res.end('error');
});


//代理模块 直接 跳转到代理地址
function proxyWeb(req,res,serviceName,addressPath,serviceAddress){
	if(!serviceAddress){
		console.log('serviceName not exist --->127.0.0.1:8080');
		serviceAddress='127.0.0.1:8080';
	}
	//将其代理至指定位置
	console.log("target:"+serviceAddress);
	proxy.web(req,res,{
		target:'http://'+serviceAddress
	});
}

/**
 * 通过 服务名 清楚所有地址节点缓存
 */
function remove_cache(serviceName,servicePath){
	var addressNodes=cache.get('$'+serviceName+'_');
	for (var i = addressNodes.length - 1; i >= 0; i--) {
		var addressPath=servicePath+'/';
		addressPath+=addressNodes[i];
		cacheAddress.remove('$'+serviceName+'_'+addressPath+'_');
	}
	cache.remove('$'+serviceName+'_');
}

/**
 * 通过 zookeeper 获取 地址节点数据
 */
function zk_getData(req,res,serviceName,servicePath,addressPath){
	//判断是否存在该服务节点
	zk.exists(servicePath,
			function(event){
				
			},
			function(error,stat){
				if (stat) {
					zk.getData(addressPath,function(error,serviceAddress){
						if (error) {
							console.log('zk.getData error:'+error.stack);
							proxyWeb(req,res);
							return;
						}
						if(!serviceAddress){
							console.log('serviceAddress node is not exist');
							proxyWeb(req,res);
							return;
						}
						cacheAddress.set('$'+serviceName+'_'+addressPath+'_',serviceAddress);		
						proxyWeb(req,res,serviceName,addressPath,serviceAddress);
						return;
					});
				}
			}
		);
}

/**
 * 通过 缓存 获取 地址节点数据
 */
function getData(req,res,serviceName,servicePath,addressPath){
	zk.exists(addressPath,
			function(event){
			},
			function(error,stat){
				if (stat) {
					if(cacheAddress.get('$'+serviceName+'_'+addressPath+'_')){
						proxyWeb(req,res,serviceName,addressPath,cacheAddress.get('$'+serviceName+'_'+addressPath+'_'));
						return;
					}
					
				}
				remove_cache(serviceName,servicePath);
				getChildren(req,res,serviceName,servicePath);
			}
		);
}




/**
 * 通过 zookeeper 获取 服务节点数据
 */
function getChildren(req,res,serviceName,servicePath){
	//获取服务器路径下的地址节点
	zk.getChildren(servicePath,function(error,addressNodes){
		//获取节点异常--->跳转至异常|需要根据 请求内容 反馈内容
		//假设get[既无服务体]的请求皆为 前端页面请求-->返回异常页面
		//假设post[既存在服务体]的请求皆为 后端ajax请求-->响应响应码json
		if(error){
			console.log('zk.getChildren error:'+error.stack);
			proxyWeb(req,res);
			return;
		}
		var size=addressNodes.length;
		if(size==0){
			console.log('address node is not exist');
			proxyWeb(req,res);
			return;
		}
		//生成地址路径
		cache.set('$'+serviceName+'_',addressNodes);
		var addressPath=servicePath+'/';
		addressPath+=addressNodes[parseInt(Math.random()*size)];
		zk_getData(req,res,serviceName,servicePath,addressPath);
		

	});
}

/*返回目标地址算法
*@parm serviceName 服务名
*@result target 目标服务器：127.0.0.1:8080
*/
function getServiceAddress (req,res,serviceName){
	//表示未传入服务名--默认为 服务器 get请求加载前端静态数据，默认跳转至前端
	//多前端服务后 可采用复默认值 的方式返回 target。
	var target='';
	var REGISTRY_PORT=REGISTRY_PORT_WEB;

	//注意 后期实现 前端服务注册后 可注释
	if(!serviceName){
		proxyWeb(req,res);
		return ;
	}

	if(serviceName){
		REGISTRY_PORT=REGISTRY_PORT_SERVER;
	}

	
	//获取服务路径
	var servicePath=REGISTRY_PORT+'/'+serviceName;

	if (cache.get('$'+serviceName+'_')) {
		var addressNodes=cache.get('$'+serviceName+'_');
		
		var size=addressNodes.length;

		if (size>0) {

			var addressPath=servicePath+'/';

			addressPath+=addressNodes[parseInt(Math.random()*size)];
			
			if(cacheAddress.get('$'+serviceName+'_'+addressPath+'_')){
				
				getData(req,res,serviceName,servicePath,addressPath);

				return;
			}else{
			
				zk_getData(req,res,serviceName,servicePath,addressPath);
				return;
			}
			
		}
	}

	getChildren(req,res,serviceName,servicePath);
}



//启动web服务器
//创建http请求服务 并 实现 服务发现和 反向代理
var app=express();
app.use(express.static('public'));
app.all('*',function(req,res){

		var serviceName=req.get('Service-Name');
		
		//插入 清空 请求判断 清空 
		//if(){remove_cache(serviceName,servicePath);}

		getServiceAddress(req,res,serviceName);
});

app.listen(PORT,function(){
	console.log('server is running at %d',PORT);
});