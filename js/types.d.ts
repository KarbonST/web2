interface Window {
  dispatch: (eventName: string, detail?: Record<string, any>) => void
}

type BaseCarParams = {
  brandId: number;
  modelId: number;
};

type ToggleCarParams = BaseCarParams

type RemoveCarParams = BaseCarParams

type EditCarParams = BaseCarParams & {
  title: string;
  description: string;
};

type ShowEditModelFormParams = BaseCarParams;

type ShowEditBrandFormParams = {
  brandId: number;
};

type RemoveAllModelsParams = {
  brandId: number;
};

type RemoveBrandParams = {
  brandId: number;
};

type ShowGetFakeModelsParams = {
  brandId: number;
};

type BrandHasNoModelParams = {
  brandId: number;
};

type GetDataParams = {
  brandId: number;
  modelId?: number | null;
};

type ServerModel = {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

type GetBrandParams = {
  id: number;
  models?: ModelGroups | null;
}

type GetModelParams = {
  brandId?: number | null;
  modelId: number;
  brand?: Brand | null;
};

type FilterModelsParams = {
  brandId: number;
  reserved: string;
};

type Model = {
  id: number;
  brandId: number;
  title: string;
  description: string;
  reserved: boolean;
};

type Brand = {
  id: number;
  title: string;
  description: string;
  models: Model[];
}

type ModelGroups = Brand[];

type FakeUser = {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}
