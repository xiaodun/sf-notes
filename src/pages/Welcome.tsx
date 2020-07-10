import React from "react";
import { isEqual } from "lodash";
import { Button } from "antd";
import request from "@/utils/request";
console.log("wx", 12);
export default () => {
  const requestList = async () => {
    const response = await request.get("/api/notes/list", {
      params: {
        name: 12,
      },
    });
    console.log("wx", response);
  };
  return (
    <div>
      <Button onClick={requestList}>测试</Button>
    </div>
  );
};
