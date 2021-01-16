import memoize from 'memoizee';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let i = 0;
const request = {
  get: async (url: string): Promise<User> => {
    console.log('getting', url);
    await sleep(1000);

    if (i === 0) {
      i += 1;
      throw new Error('boom!');
    }

    return {
      type: 'user'
    };
  }
};
type User = {
  type: 'user'
}

const getUserById = memoize(async (userId: string): Promise<User> => {
  console.log('!!!!!!!!!!!!!!!!');
  console.log('getUserById');
  console.log('!!!!!!!!!!!!!!!!');
  const user = await request.get(`https://users-service/v1/${userId}`);
  return user;
}, { promise: true });

// const userPromisesCache = new Map<string, Promise<User>>();

// const getUserById = (userId: string): Promise<User> => {
//   if (!userPromisesCache.has(userId)) {
//     const userPromise = request.get(`https://users-service/v1/${userId}`);
//     userPromisesCache.set(userId, userPromise);
//   }

//   return userPromisesCache.get(userId)!;
// };


(async () => {
  // await Promise.all([
  //   getUserById('user1'),
  //   getUserById('user1')
  // ]);

  try {
    await getUserById('user1');
  } catch (e) {
    console.log('caught error!', e);
  }

  await sleep(0);
  await getUserById('user1');


  // await getUserById('user1');
  // await getUserById('user1');
  // await getUserById('user2');
})();
