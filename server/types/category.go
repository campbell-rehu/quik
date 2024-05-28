package types

const (
	Easy     string = "Easy"
	Moderate        = "Moderate"
	Hard            = "Hard"
	Hardest         = "Hardest"
)

var Difficulties []string = []string{
	Easy, Moderate, Hard, Hardest,
}

type Category = map[string][]string

var C Category = map[string][]string{
	Easy: {
		"Electronics",
		"Baked goods",
		"In a doctorʻs office",
		"5-letter words",
		"Something yellow",
		"Things with buttons",
		"Drinks & Beverages",
		"In the yard or garden",
		"Things at a party",
		"Pizza toppings",
		"In the Jungle",
		"Girl Names",
		"Restaurants",
		"Sports",
	},
	Moderate: {
		"Desserts",
		"Something round",
		"Candy",
		"Musicians & Musical Groups",
		"Cars & Trucks",
		"Movies",
		"Player’s Choice",
		"Plants & Trees",
		"Song titles",
		"Pet names",
		"Ice cream flavours",
		"Hobbies",
		"Actresses",
		"Retail Stores",
	},
	Hard: {
		"Precious Metals & Gemstones",
		"Something Scary",
		"Something wet",
		"At a wedding",
		"Celebrities",
		"Sports Equipment",
		"Cartoons",
		"Fish",
		"Authors",
		"School Subjects",
		"Footwear",
		"Books",
		"Historical Figures",
	},
	Hardest: {
		"Bodies of Water",
		"Cosmetics & Toiletries",
		"Musical Instruments",
		"In the Ocean",
		"Something Blue",
		"Adjectives",
		"Something Green",
		"Breakfast foods",
		"Weapons",
		"Comedies",
		"Car Terms",
		"Politics and Politicians",
		"Flowers",
	},
}
