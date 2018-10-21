(function(){
    return function(argData,argParams){
        //argData 数据的副本
        let start = (argParams.page - 1) * argParams.size;
        let end = start + argParams.size;
        let arr = argData.slice(start,end);

        return {

            isWrite:false,//是否覆盖数据
            //data:argData,//需要存储的新数据
            response:{//返回的数据
                code:200,
                data:{
                    data:arr,
                    total:argData.length
                }
            }
        }
    }
})()