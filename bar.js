var cocktails = [
  new Cocktail("negroni", [
    new Ingredient('gin', 1),
    new Ingredient('campari', 1),
    new Ingredient('vermouth', 1)
    ],
    'stir into glass over ice, garnish and serve',
    'orange peel',
    'low-ball glass'),
  new Cocktail("old fashioned", [
    new Ingredient('whiskey', "5 cl"),
    new Ingredient('bitters', "2 dashes of"),
    new Ingredient('sugar cube', "one")
    ],
    'place sugar cube in glass and saturate with bitters, add a dash of plain water. Muddle until dissolved. Fill glas with ice cubes and add whiskey.',
    'orange peel',
    'low-ball glass')
];

function Cocktail(name, ingredients, instructions, garnish, glass) {
  this.name = name;
  this.ingredients = ingredients;
  this.instructoins = instructions;
  this.garnish = garnish;
  this.glass = glass;
}

function Ingredient(mixer, part) {
  this.mixer = mixer;
  this.part = part;
}
