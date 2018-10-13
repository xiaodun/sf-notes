(function(){
    return function(argData,argParams){
        return {

            isWrite:true,//是否覆盖数据
            data:JSON.parse(argParams).data,//需要存储的新数据
            response:{//返回的数据
                code:200,
                data:{
                    message:"存储成功"
                }
            }
        }
    }
})()