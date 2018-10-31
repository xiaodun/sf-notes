class UrlHelperClass {
    constructor() {

    }
    getUri(argUrl){
        //处理以协议开头的路径
        let url;
        if(argUrl == undefined){
            url = location.href;

        }
        else if(argUrl.constructor != Object){
            url = argUrl;
        }

        let urlElements = this.splitUrl(url);
        return urlElements.uri;


    }
    splitUrl(argUrl){
        let url;
        if(argUrl == undefined){
            url = location.href;

        }
        else if(argUrl.constructor != Object){
            url = argUrl;
        }
        let regexp = /(\w+):\/\/([^:/]+):?(\d+)?([^?]+)\??(.+)?/;
        let result = argUrl.match(regexp);
        let urlElements = {
            protocol:result[1],
            domain:result[2],
            port:result[3],
            uri:decodeURIComponent(result[4]),
            query:decodeURIComponent(result[5])
        }
        return urlElements;
        
    }
}
let UrlHelper = new UrlHelperClass();
export  {UrlHelper}