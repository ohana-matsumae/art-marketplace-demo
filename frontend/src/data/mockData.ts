export interface ArtPiece {
  id: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  seller: Seller;
  tags: string[];
  likes: number;
  description?: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface Seller {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  followers: number;
  totalSales: number;
  rating: number;
  coverImage: string;
  joinedDate: string;
  isVerified?: boolean;
}

const SELLERS: Seller[] = [
  {
    id: "seller-1",
    username: "lois_alonsagay",
    displayName: "Lois Alonsagay",
    avatar: "https://picsum.photos/seed/avatar1/200/200",
    bio: "Digital surrealist blending dreamscapes with neon realities. Creating art that questions the boundary between the physical and digital worlds.",
    followers: 4821,
    totalSales: 312,
    rating: 4.9,
    coverImage: "https://picsum.photos/seed/cover1/1200/400",
    joinedDate: "March 2022",
  },
  {
    id: "seller-2",
    username: "neo_brushwork",
    displayName: "Neo Brushwork",
    avatar: "https://picsum.photos/seed/avatar2/200/200",
    bio: "Abstract expressionist working with generative algorithms to create large-format pieces. Every artwork is one-of-a-kind.",
    followers: 2390,
    totalSales: 178,
    rating: 4.7,
    coverImage: "https://picsum.photos/seed/cover2/1200/400",
    joinedDate: "June 2021",
  },
  {
    id: "seller-3",
    username: "chromatic_soul",
    displayName: "Chromatic Soul",
    avatar: "https://picsum.photos/seed/avatar3/200/200",
    bio: "Exploring identity through vibrant color palettes. My art challenges conventional portraiture.",
    followers: 7102,
    totalSales: 540,
    rating: 4.95,
    coverImage: "https://picsum.photos/seed/cover3/1200/400",
    joinedDate: "January 2020",
    isVerified: true,
  },
  {
    id: "seller-4",
    username: "void_architect",
    displayName: "Void Architect",
    avatar: "https://picsum.photos/seed/avatar4/200/200",
    bio: "Dark minimal aesthetic. I sculpt emptiness into meaning with negative space and monochromatic tones.",
    followers: 1540,
    totalSales: 89,
    rating: 4.6,
    coverImage: "https://picsum.photos/seed/cover4/1200/400",
    joinedDate: "October 2023",
  },
];

export const MOCK_ARTWORKS: ArtPiece[] = [
  {
    id: "art-1",
    title: "Neon Reverie",
    price: 0.42,
    currency: "USD",
    image: "https://picsum.photos/seed/art1/600/700",
    seller: SELLERS[0],
    tags: ["surreal", "neon", "digital"],
    likes: 284,
    description:
      "A luminous dreamscape blending neon colors and surreal forms, evoking a sense of wonder and digital fantasy.",
    isFeatured: true,
    isNew: true,
  },
  {
    id: "art-2",
    title: "Cascade Protocol",
    price: 0.18,
    currency: "ETH",
    image: "https://picsum.photos/seed/art2/600/750",
    seller: SELLERS[1],
    tags: ["abstract", "generative"],
    likes: 91,
    description:
      "Generative abstract art inspired by the flow of data and cascading algorithms, rendered in bold shapes.",
  },
  {
    id: "art-3",
    title: "Chromatic Identity #7",
    price: 1.05,
    currency: "ETH",
    image: "https://picsum.photos/seed/art3/600/680",
    seller: SELLERS[2],
    tags: ["portrait", "vibrant"],
    likes: 631,
    description:
      "A vibrant portrait exploring the spectrum of human emotion through bold color and expressive brushwork.",
    isFeatured: true,
  },
  {
    id: "art-4",
    title: "Void Study III",
    price: 0.09,
    currency: "ETH",
    image: "https://picsum.photos/seed/art4/600/720",
    seller: SELLERS[3],
    tags: ["minimal", "dark"],
    likes: 44,
    description:
      "A minimalist exploration of emptiness, using dark tones and negative space to evoke introspection.",
    isNew: true,
  },
  {
    id: "art-5",
    title: "Stellar Migration",
    price: 0.33,
    currency: "ETH",
    image: "https://picsum.photos/seed/art5/600/760",
    seller: SELLERS[0],
    tags: ["space", "surreal"],
    likes: 199,
    description:
      "Surreal cosmic journey of stars traversing the universe, blending science fiction and fantasy.",
  },
  {
    id: "art-6",
    title: "Fractal Bloom",
    price: 0.55,
    currency: "ETH",
    image: "https://picsum.photos/seed/art6/600/690",
    seller: SELLERS[2],
    tags: ["nature", "generative"],
    likes: 412,
    description:
      "Generative fractal patterns inspired by blooming flowers, merging mathematics and organic beauty.",
  },
  {
    id: "art-7",
    title: "Echo Chamber",
    price: 0.22,
    currency: "ETH",
    image: "https://picsum.photos/seed/art7/600/740",
    seller: SELLERS[1],
    tags: ["abstract", "sound"],
    likes: 67,
    description:
      "Abstract visualization of sound waves reverberating in a digital echo chamber.",
    isNew: true,
  },
  {
    id: "art-8",
    title: "The Last Signal",
    price: 0.78,
    currency: "ETH",
    image: "https://picsum.photos/seed/art8/600/710",
    seller: SELLERS[3],
    tags: ["dark", "sci-fi"],
    likes: 253,
    description:
      "A mysterious sci-fi scene capturing the moment of a final transmission from a distant world.",
  },
  {
    id: "art-9",
    title: "Dreamgate Alpha",
    price: 0.14,
    currency: "ETH",
    image: "https://picsum.photos/seed/art9/600/730",
    seller: SELLERS[0],
    tags: ["surreal", "portal"],
    likes: 108,
    description:
      "A surreal portal artwork inviting viewers to step into a world of dreams and possibilities.",
  },
  {
    id: "art-10",
    title: "Entropy Dance",
    price: 0.61,
    currency: "ETH",
    image: "https://picsum.photos/seed/art10/600/680",
    seller: SELLERS[2],
    tags: ["abstract", "movement"],
    likes: 389,
    description:
      "Abstract depiction of chaos and order in motion, inspired by the concept of entropy.",
  },
  {
    id: "art-11",
    title: "Monolith I",
    price: 0.29,
    currency: "ETH",
    image: "https://picsum.photos/seed/art11/600/800",
    seller: SELLERS[3],
    tags: ["minimal", "architectural"],
    likes: 77,
    description:
      "Minimalist architectural study of a solitary monolith, evoking strength and mystery.",
  },
  {
    id: "art-12",
    title: "Pulse Wave",
    price: 0.17,
    currency: "ETH",
    image: "https://picsum.photos/seed/art12/600/660",
    seller: SELLERS[1],
    tags: ["generative", "motion"],
    likes: 155,
    description:
      "Generative art capturing the rhythmic energy of a pulse wave in vibrant motion.",
    isNew: true,
  },
];

export const CURRENT_USER: Seller = {
  id: "seller-1",
  username: "lois_alonsagay",
  displayName: "Lois Alonsagay",
  avatar: "https://picsum.photos/seed/avatar1/200/200",
  bio: "Digital surrealist blending dreamscapes with neon realities. Creating art that questions the boundary between the physical and digital worlds.",
  followers: 4821,
  totalSales: 312,
  rating: 4.9,
  coverImage: "https://picsum.photos/seed/cover1/1200/400",
  joinedDate: "March 2022",
};

export const MY_ARTWORKS = MOCK_ARTWORKS.filter(
  (a) => a.seller.id === CURRENT_USER.id,
);

export const CATEGORIES = [
  "All",
  "Surreal",
  "Abstract",
  "Portrait",
  "Minimal",
  "Generative",
  "Dark",
  "Nature",
];
