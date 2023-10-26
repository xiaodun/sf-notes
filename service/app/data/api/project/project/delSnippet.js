
(function () {
  return function (argData, argParams, external) {
    const fs = require("fs");
    const currentProject = argData.projectList.find(item=>item.id == argParams.projectId);
    if(argParams.groupName){
      const currentGroup = currentProject.snippetList.filter(item=>item.isGroup).find(item=>item.name == argParams.groupName)
      const currentIndex = currentGroup.children.findIndex(item=>item.name == argParams.snippetName)
      currentGroup.children.splice(currentIndex,1)
    }
    else{
      const currentIndex = currentProject.snippetList.findIndex(item=>item.name == argParams.snippetName)
      currentProject.snippetList.splice(currentIndex,1)
      console.log(currentIndex);

    }

    fs.unlinkSync(external.getSnippetScriptPath(currentProject.name,argParams.snippetName))
    return {
      isWrite: true,
      data:argData,
      response: {
        code: 200,
        data: {
          success:true
        },
      },
    };
  };
})();
      