import sha1 from 'sha1';

export const hashPassword = (password: string): string => {
  return sha1(password);
};
