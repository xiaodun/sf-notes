
(function(){
    return function(argData,argParams){
        let id = argParams.id;
        let arr = argData.filter(element => {
            if(element.id == id){
                return true;
            }
        });
        return {

            isWrite:false,//是否覆盖数据
            // data:data,//需要存储的新数据
            response:{//返回的数据
                code:200,
                data:arr
            }
        }
    }
})()