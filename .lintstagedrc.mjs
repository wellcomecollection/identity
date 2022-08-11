export default {
  '*': (allFiles) => {
    return [`prettier --ignore-unknown --write ${allFiles.join(' ')}`];
  },
  '*.tf': (allFiles) => {
    return ['terraform fmt -recursive'];
  },
};
