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
}

const QUERY = `
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
    }
  }
}
`;

export const fetchTrendingAnime = async (page = 1, perPage = 10): Promise<AnimeData[]> => {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: QUERY,
        variables: { page, perPage },
      }),
    });

    const data = await response.json();
    return data.data.Page.media;
  } catch (error) {
    console.error("Anilist API Error:", error);
    return [];
  }
};