(function(){
    return function(argData,argParams){
        let data = argData;//数据的副本
        console.log(argData,argParams);
        return {
            isWrite:false,//是否覆盖数据
            response:{//返回的数据
                code:200,
                data:{
    
                }
            }
        }
    }
})()