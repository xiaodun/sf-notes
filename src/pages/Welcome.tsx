import React from "react";
import { isEqual } from "lodash";
export default (): React.ReactNode => () => {
  return (
    <div>
      {isEqual(1, 1) + ""} {keyB}{" "}
    </div>
  );
};
