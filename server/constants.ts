export enum Difficulty {
  Easy = 'Easy',
  Moderate = 'Moderate',
  Hard = 'Hard',
  Hardest = 'Hardest',
}

export type Category = {
  [Difficulty.Easy]: string[]
  [Difficulty.Moderate]: string[]
  [Difficulty.Hard]: string[]
  [Difficulty.Hardest]: string[]
}

export const Categories: Category = {
  [Difficulty.Easy]: [
    'Electronics',
    'Baked goods',
    'In a doctorʻs office',
    '5-letter words',
    'Something yellow',
    'Things with buttons',
    'Drinks & Beverages',
    'In the yard or garden',
    'Things at a party',
    'Pizza toppings',
    'In the Jungle',
    'Girl Names',
    'Restaurants',
    'Sports',
  ],
  [Difficulty.Moderate]: [
    'Desserts',
    'Something round',
    'Candy',
    'Musicians & Musical Groups',
    'Cars & Trucks',
    'Movies',
    'Player’s Choice',
    'Plants & Trees',
    'Song titles',
    'Pet names',
    'Ice cream flavours',
    'Hobbies',
    'Actresses',
    'Retail Stores',
  ],
  [Difficulty.Hard]: [
    'Precious Metals & Gemstones',
    'Something Scary',
    'Something wet',
    'At a wedding',
    'Celebrities',
    'Sports Equipment',
    'Cartoons',
    'Fish',
    'Authors',
    'School Subjects',
    'Footwear',
    'Books',
    'Historical Figures',
  ],
  [Difficulty.Hardest]: [
    'Bodies of Water',
    'Cosmetics & Toiletries',
    'Musical Instruments',
    'In the Ocean',
    'Something Blue',
    'Adjectives',
    'Something Green',
    'Breakfast foods',
    'Weapons',
    'Comedies',
    'Car Terms',
    'Politics and Politicians',
    'Flowers',
  ],
}
