
export interface AnimeData {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  description: string;
  coverImage: {
    extraLarge: string;
  };
  bannerImage: string;
  genres: string[];
  averageScore: number;
  studios: {
    nodes: { name: string }[];
  };
  trailer?: {
    id: string;
    site: string;
    thumbnail: string;
  };
}

export interface StudioData {
  id: number;
  name: string;
  favourites: number;
  siteUrl?: string;
  media: {
    nodes: {
      id: number;
      title: {
        romaji: string;
        english: string;
      };
      coverImage: {
        extraLarge: string;
      };
      bannerImage: string | null;
      averageScore: number;
    }[];
  }
}

const ANIME_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(sort: TRENDING_DESC, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        extraLarge
      }
      bannerImage
      genres
      averageScore
      studios(isMain: true) {
        nodes {
          name
        }
      }
      trailer {
        id
        site
        thumbnail
      }
    }
  }
}
`;

const POPULAR_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(sort: POPULARITY_DESC, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        extraLarge
      }
      bannerImage
      genres
      averageScore
      studios(isMain: true) {
        nodes {
          name
        }
      }
      trailer {
        id
        site
        thumbnail
      }
    }
  }
}
`;

const FAVORITE_QUERY = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(sort: FAVOURITES_DESC, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        extraLarge
      }
      bannerImage
      genres
      averageScore
      studios(isMain: true) {
        nodes {
          name
        }
      }
      trailer {
        id
        site
        thumbnail
      }
    }
  }
}
`;

const SEARCH_QUERY = `
query ($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        extraLarge
      }
      bannerImage
      genres
      averageScore
      studios(isMain: true) {
        nodes {
          name
        }
      }
      trailer {
        id
        site
        thumbnail
      }
    }
  }
}
`;

const GENRE_QUERY = `
query {
  GenreCollection
  Page(page: 1, perPage: 50) {
    media(sort: POPULARITY_DESC, type: ANIME) {
      coverImage {
        extraLarge
      }
      genres
    }
  }
}
`;

const GENRE_SEARCH_QUERY = `
query ($genre: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(genre: $genre, type: ANIME, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        extraLarge
      }
      bannerImage
      genres
      averageScore
      studios(isMain: true) {
        nodes {
          name
        }
      }
      trailer {
        id
        site
        thumbnail
      }
    }
  }
}
`;

const RECOMMENDATION_QUERY = `
query ($genres: [String], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(genre_in: $genres, sort: POPULARITY_DESC, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        extraLarge
      }
      bannerImage
      genres
      averageScore
      studios(isMain: true) {
        nodes {
          name
        }
      }
      trailer {
        id
        site
        thumbnail
      }
    }
  }
}
`;

const STUDIO_QUERY = `
query {
  Page(page: 1, perPage: 20) {
    studios(sort: FAVOURITES_DESC) {
      id
      name
      favourites
      siteUrl
      media(sort: POPULARITY_DESC, perPage: 4) {
        nodes {
          id
          title {
            romaji
            english
          }
          coverImage {
            extraLarge
          }
          bannerImage
          averageScore
        }
      }
    }
  }
}
`;

const FALLBACK_STUDIOS: StudioData[] = [
  {
    id: 1,
    name: "MAPPA",
    favourites: 120000,
    media: {
      nodes: [
        { id: 127230, title: { romaji: "Chainsaw Man", english: "Chainsaw Man" }, coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-FlochcFsqoO4.png" }, bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/127230-q97O7kY4X7iW.jpg", averageScore: 85 },
        { id: 113415, title: { romaji: "Jujutsu Kaisen", english: "Jujutsu Kaisen" }, coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbIXMzQC468j.png" }, bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxCeVhq4.jpg", averageScore: 88 }
      ]
    }
  },
  {
    id: 2,
    name: "Kyoto Animation",
    favourites: 110000,
    media: {
      nodes: [
        { id: 21856, title: { romaji: "Violet Evergarden", english: "Violet Evergarden" }, coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/nx21856-1Z40K8G5jK1z.jpg" }, bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21856-4c4h5r1X4j2W.jpg", averageScore: 90 },
        { id: 2885, title: { romaji: "Koe no Katachi", english: "A Silent Voice" }, coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx2885-Q91a4Fv6b1bI.png" }, bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/2885-bX21Yj07j67W.jpg", averageScore: 91 }
      ]
    }
  },
  {
    id: 3,
    name: "ufotable",
    favourites: 105000,
    media: {
      nodes: [
        { id: 101922, title: { romaji: "Kimetsu no Yaiba", english: "Demon Slayer" }, coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn17oe1SOWX.png" }, bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/101922-YCZfy1u8t1eC.jpg", averageScore: 87 },
        { id: 10087, title: { romaji: "Fate/Zero", english: "Fate/Zero" }, coverImage: { extraLarge: "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx10087-w5I0jVj6k28O.png" }, bannerImage: "https://s4.anilist.co/file/anilistcdn/media/anime/banner/10087-10j77X24X4j5.jpg", averageScore: 85 }
      ]
    }
  }
];

const ANIME_DETAILS_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
    description
    coverImage {
      extraLarge
    }
    bannerImage
    genres
    averageScore
    studios(isMain: true) {
      nodes {
        name
      }
    }
    trailer {
      id
      site
      thumbnail
    }
  }
}
`;

const IDS_QUERY = `
query ($ids: [Int], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(id_in: $ids, type: ANIME) {
      id
      title {
        romaji
        english
        native
      }
      description
      coverImage {
        extraLarge
      }
      bannerImage
      genres
      averageScore
      studios(isMain: true) {
        nodes {
          name
        }
      }
    }
  }
}
`;

export const fetchAnimeByIds = async (ids: number[]): Promise<AnimeData[]> => {
  if (ids.length === 0) return [];
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: IDS_QUERY,
        variables: { ids, page: 1, perPage: 50 },
      }),
    });

    const data = await response.json();
    return data.data?.Page?.media || [];
  } catch (error) {
    console.error("Anilist API Error:", error);
    return [];
  }
};

export const fetchAnimeDetails = async (id: number): Promise<AnimeData | null> => {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: ANIME_DETAILS_QUERY,
        variables: { id },
      }),
    });

    const data = await response.json();
    return data.data?.Media || null;
  } catch (error) {
    console.error("Anilist API Error:", error);
    return null;
  }
};

export const fetchTrendingAnime = async (page = 1, perPage = 10): Promise<AnimeData[]> => {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: ANIME_QUERY,
        variables: { page, perPage },
      }),
    });

    const data = await response.json();
    return data.data?.Page?.media || [];
  } catch (error) {
    console.error("Anilist API Error:", error);
    return [];
  }
};

export const fetchPopularAnime = async (page = 1, perPage = 10): Promise<AnimeData[]> => {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: POPULAR_QUERY,
        variables: { page, perPage },
      }),
    });

    const data = await response.json();
    return data.data?.Page?.media || [];
  } catch (error) {
    console.error("Anilist API Error:", error);
    return [];
  }
};

export const fetchAllTimeFavorites = async (page = 1, perPage = 10): Promise<AnimeData[]> => {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: FAVORITE_QUERY,
        variables: { page, perPage },
      }),
    });

    const data = await response.json();
    return data.data?.Page?.media || [];
  } catch (error) {
    console.error("Anilist API Error:", error);
    return [];
  }
};

export const searchAnime = async (search: string, page = 1, perPage = 10): Promise<AnimeData[]> => {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: { search, page, perPage },
      }),
    });

    const data = await response.json();
    return data.data?.Page?.media || [];
  } catch (error) {
    console.error("Anilist API Error:", error);
    return [];
  }
};

export const fetchGenresWithImages = async (): Promise<{ name: string; image: string }[]> => {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: GENRE_QUERY,
      }),
    });

    const data = await response.json();
    const genres: string[] = data.data?.GenreCollection || [];
    const media: any[] = data.data?.Page?.media || [];

    // Map genres to an image from the popular media list
    return genres.map(genre => {
      const matchingAnime = media.find(m => m.genres.includes(genre));
      return {
        name: genre,
        image: matchingAnime?.coverImage?.extraLarge || "https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-FlochcFsqoO4.png" // Fallback
      };
    }).filter(g => g.name !== 'Hentai'); // Filter out NSFW if desired, or keep it. Usually safer to filter.
  } catch (error) {
    console.error("Anilist API Error:", error);
    return [];
  }
};

export const fetchAnimeByGenre = async (genre: string, page = 1, perPage = 10): Promise<AnimeData[]> => {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: GENRE_SEARCH_QUERY,
        variables: { genre, page, perPage },
      }),
    });

    const data = await response.json();
    return data.data?.Page?.media || [];
  } catch (error) {
    console.error("Anilist API Error:", error);
    return [];
  }
};

export const fetchRecommendations = async (genres: string[], page = 1, perPage = 20): Promise<AnimeData[]> => {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: RECOMMENDATION_QUERY,
        variables: { genres, page, perPage },
      }),
    });

    const data = await response.json();
    return data.data?.Page?.media || [];
  } catch (error) {
    console.error("Anilist API Error:", error);
    return [];
  }
};

export const fetchStudios = async (): Promise<StudioData[]> => {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: STUDIO_QUERY,
      }),
    });

    const data = await response.json();

    if (data.errors || !data.data || !data.data.Page || !data.data.Page.studios) {
      console.warn("Anilist API Error, using fallback data:", data.errors);
      return FALLBACK_STUDIOS;
    }

    // Filter out studios with 0 media items to prevent broken UI
    const validStudios = data.data.Page.studios.filter((s: StudioData) => s.media && s.media.nodes && s.media.nodes.length > 0);
    
    if (validStudios.length === 0) {
      return FALLBACK_STUDIOS;
    }

    return validStudios;
  } catch (error) {
    console.error("Anilist API Fetch Exception, using fallback data:", error);
    return FALLBACK_STUDIOS;
  }
};
