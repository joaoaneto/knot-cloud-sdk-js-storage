import Storage from 'Storage';

const storage = new Storage('data.cloud', 80);
console.log(storage.listData());