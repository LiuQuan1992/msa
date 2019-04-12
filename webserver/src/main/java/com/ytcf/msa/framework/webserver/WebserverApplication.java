package com.ytcf.msa.framework.webserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
@SpringBootApplication(scanBasePackages = "com.ytcf.msa.framework")
public class WebserverApplication {
	@RequestMapping(name="HelloService",method= RequestMethod.GET,path = "/hello")
	public String hello(){
		return  "Hello";
	}
	public static void main(String[] args) {
		SpringApplication.run(WebserverApplication.class, args);
	}

}
