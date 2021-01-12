const { join, parse } = require('path');
const { readdirSync, writeFileSync } = require('fs');
const { compileFromFile } = require('json-schema-to-typescript');

const files = readdirSync(join(__dirname, '../models')).map((f) => join(__dirname, '../models', f));

const promises = [];
for (const file of files) {
  // compile from file
  promises.push(compileFromFile(file)
    .then(ts => {
      const {name} = parse(file);
      console.log(`Writing ${name}`)
      writeFileSync(`packages/apps/account-management/src/types/schemas/${name}.ts`, ts);
    })
  );
}

Promise.all(promises).then(() => {

  console.log('Complete.');
})
