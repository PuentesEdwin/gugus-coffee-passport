export type Layer = 'espresso' | 'milk' | 'foam' | 'water' | 'ice' | 'chocolate' | 'cold' | 'syrup' | 'matcha' | 'filter' | 'cream'

export interface Drink {
  key: string
  name: string
  cup: 'demitasse' | 'cup' | 'mug' | 'glass' | 'tall'
  /** bottom → top, parts add up to roughly the cup */
  layers: [Layer, number][]
  what: string
  ratio: string
  bitter: number // typical bitterness 1–5
  tip: string
}

export const LAYER_INFO: Record<Layer, { label: string; color: string }> = {
  espresso: { label: 'Espresso', color: '#4a2c1a' },
  milk: { label: 'Steamed milk', color: '#e9d7b8' },
  foam: { label: 'Milk foam', color: '#fbf5ea' },
  water: { label: 'Hot water', color: '#c79a6b' },
  ice: { label: 'Ice', color: '#d6e6ea' },
  chocolate: { label: 'Chocolate', color: '#6b3a24' },
  cold: { label: 'Cold brew', color: '#5a3520' },
  syrup: { label: 'Syrup', color: '#c98a3a' },
  matcha: { label: 'Matcha', color: '#8aa04a' },
  filter: { label: 'Filter coffee', color: '#7a4a2a' },
  cream: { label: 'Cream', color: '#f3e6cc' },
}

export const DRINKS: Drink[] = [
  { key: 'espresso', name: 'Espresso', cup: 'demitasse', layers: [['espresso', 1]], what: 'A short, concentrated shot pushed through finely ground coffee under pressure. The base of almost everything else.', ratio: '1 : 2 coffee to water · ~30 ml', bitter: 4, tip: 'Look for the crema, the golden foam on top. Drink it within a minute.' },
  { key: 'cortado', name: 'Cortado', cup: 'glass', layers: [['espresso', 1], ['milk', 1]], what: 'Espresso “cut” with an equal amount of warm milk. Smooth, still strong.', ratio: '1 : 1 espresso to milk', bitter: 3, tip: 'Great for judging a café’s espresso without it being too intense.' },
  { key: 'macchiato', name: 'Macchiato', cup: 'demitasse', layers: [['espresso', 2], ['foam', 1]], what: 'Espresso “stained” with a dollop of milk foam.', ratio: 'Espresso + a spoon of foam', bitter: 4, tip: 'Not the big caramel drink from chains: the real one is tiny.' },
  { key: 'flat-white', name: 'Flat white', cup: 'cup', layers: [['espresso', 1], ['milk', 2], ['foam', 0.3]], what: 'Double ristretto with silky, thin microfoam. Born in Australia & New Zealand.', ratio: '1 : 2 espresso to milk', bitter: 3, tip: 'Stronger coffee taste than a latte, velvety texture.' },
  { key: 'cappuccino', name: 'Cappuccino', cup: 'cup', layers: [['espresso', 1], ['milk', 1], ['foam', 1]], what: 'Equal thirds espresso, steamed milk and airy foam.', ratio: '1 : 1 : 1', bitter: 3, tip: 'In Italy it’s a morning drink. Try it with cinnamon or cocoa on top.' },
  { key: 'latte', name: 'Latte', cup: 'mug', layers: [['espresso', 1], ['milk', 4], ['foam', 0.5]], what: 'Espresso with lots of steamed milk and a thin foam layer. Home of latte art.', ratio: '1 : 4+ espresso to milk', bitter: 2, tip: 'Ask for oat milk to taste a nuttier, sweeter version.' },
  { key: 'mocha', name: 'Mocha', cup: 'mug', layers: [['chocolate', 1], ['espresso', 1], ['milk', 3], ['cream', 0.6]], what: 'A latte with chocolate. Dessert and coffee in one.', ratio: 'Espresso + chocolate + milk', bitter: 1, tip: 'Good gateway for people who “don’t like coffee”.' },
  { key: 'americano', name: 'Americano', cup: 'mug', layers: [['espresso', 1], ['water', 4]], what: 'Espresso stretched with hot water. Legend says US soldiers in Italy invented it.', ratio: '1 : 3–4 espresso to water', bitter: 3, tip: 'Closer to drip coffee but with espresso flavor.' },
  { key: 'pour-over', name: 'Pour-over', cup: 'mug', layers: [['filter', 4]], what: 'Hot water poured by hand over ground coffee in a filter (V60, Chemex, Kalita).', ratio: '1 : 16 coffee to water', bitter: 2, tip: 'Best way to taste single-origin beans: fruity, floral, tea-like.' },
  { key: 'drip', name: 'Drip coffee', cup: 'mug', layers: [['filter', 4.5]], what: 'Classic batch-brewed filter coffee. The New York deli staple.', ratio: '1 : 16–18', bitter: 3, tip: 'Ask what beans are in the batch today.' },
  { key: 'cold-brew', name: 'Cold brew', cup: 'tall', layers: [['ice', 2], ['cold', 3]], what: 'Coffee steeped in cold water for 12–24 hours. Low acid, chocolatey, strong caffeine.', ratio: '1 : 8 concentrate, diluted', bitter: 2, tip: 'Smoother and less acidic than iced coffee.' },
  { key: 'iced-coffee', name: 'Iced coffee', cup: 'tall', layers: [['ice', 2], ['filter', 3]], what: 'Hot-brewed coffee cooled down over ice. Brighter and more acidic than cold brew.', ratio: 'Brewed strong, then iced', bitter: 3, tip: 'Japanese-style iced coffee is brewed straight onto ice.' },
  { key: 'iced-latte', name: 'Iced latte', cup: 'tall', layers: [['ice', 1.5], ['milk', 2.5], ['espresso', 1]], what: 'Espresso poured over cold milk and ice.', ratio: '1 : 3 espresso to milk', bitter: 2, tip: 'Watch the espresso cascade into the milk before you stir.' },
  { key: 'affogato', name: 'Affogato', cup: 'glass', layers: [['cream', 1.5], ['espresso', 1]], what: 'A scoop of vanilla gelato “drowned” in a hot espresso shot.', ratio: '1 scoop + 1 shot', bitter: 2, tip: 'Eat it fast, the hot-cold contrast is the point.' },
  { key: 'matcha', name: 'Matcha latte', cup: 'mug', layers: [['matcha', 1], ['milk', 3.5], ['foam', 0.4]], what: 'Whisked Japanese green tea powder with milk. Not coffee, but a café classic.', ratio: '2 g matcha + milk', bitter: 2, tip: 'Grassy and sweet; good for a second round.' },
  { key: 'other', name: 'Other / signature', cup: 'cup', layers: [['espresso', 1], ['syrup', 0.6], ['milk', 2]], what: 'House specials: lavender lattes, cardamom cortados, espresso tonics…', ratio: 'Whatever the barista dreams up', bitter: 2, tip: 'Always ask for the house signature drink.' },
]

export const drinkByKey = (k: string) => DRINKS.find((d) => d.key === k) || DRINKS[DRINKS.length - 1]

export const BITTER_SCALE = [
  { n: 1, label: 'Sweet & mellow', desc: 'Barely bitter. Milky, chocolatey, or syrupy drinks.' },
  { n: 2, label: 'Soft', desc: 'A gentle coffee edge, balanced by sweetness or milk.' },
  { n: 3, label: 'Balanced', desc: 'You clearly taste coffee bitterness, but it’s pleasant.' },
  { n: 4, label: 'Bold', desc: 'Strong and roasty. Dark chocolate, toasted nuts.' },
  { n: 5, label: 'Intense', desc: 'Very bitter, smoky or burnt. Dark roast or a long extraction.' },
]

export const TASTING_STEPS = [
  { t: 'Look', d: 'Color of the crema or milk, latte art, how it’s served.' },
  { t: 'Smell', d: 'Before sipping: fruity, nutty, chocolate, floral, roasty?' },
  { t: 'Sip & slurp', d: 'Pull in a little air so it hits your whole tongue.' },
  { t: 'Acidity vs bitterness', d: 'Acidity is bright like citrus (front of tongue). Bitterness is dark like cacao (back).' },
  { t: 'Body', d: 'Is it light like tea or heavy like whole milk?' },
  { t: 'Finish', d: 'What stays after you swallow? Sweet, dry, or harsh?' },
]
