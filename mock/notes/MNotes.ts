import { Request, Response } from 'express';
import Mock from 'mockjs';

// import { parse } from 'url';
function getList(
  request: Request<{}, {}, {}, { name: string }>,
  response: Response,
) {
  return response.json(
    Mock.mock({
      'list|20': [
        {
          'id|+1': 1,
        },
      ],
    }),
  );
}
export default {
  'GET mock/api/notes/list': getList,
};
