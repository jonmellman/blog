import _ from 'lodash';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const request = {
  get: async (url: string) => {
    console.log('getting', url);
    await sleep(1000);
  }
};
type User = unknown

export const getUserById = _.memoize(async (userId: string) => {
  const user = await request.get(`https://users-service/v1/${userId}`);
  return user;
});

// const userPromisesCache = new Map<string, Promise<User>>();

// export const getUserById = async (userId: string) => {
//   if (!userPromisesCache.has(userId)) {
//     const userPromise = request.get(`https://users-service/v1/${userId}`);
//     userPromisesCache.set(userId, userPromise);
//   }

//   return userPromisesCache.get(userId);
// };

export const bar = () => {

};


(async () => {
  await Promise.all([
    getUserById('user1'),
    getUserById('user1')
  ]);


  // await getUserById('user1');
  // await getUserById('user1');
  // await getUserById('user2');
})();
