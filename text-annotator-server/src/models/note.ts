export interface Note {
  '@context': string;
  body: [{id: string, purpose: string, type: string, value: string, userID: string,
    username: string, isComment: boolean}];
  id: string;
  target: Selector[];
  type: string;
  bookID: string;
  session: {name: string, description: string, color: string, date: Date, type: string};
}

interface Selector{
  selector:[{exact: string, type: string}, {end: number, start: number, type: string}];
}