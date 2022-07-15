import { useEffect, useState } from "react";
import SelectSearch from "react-select-search";
import { getBrands, getModels, getYears } from "./backend/backend";

type Props = {
  onChange: (val: { brand?: string; model?: string; year?: string }) => void;
  brand?: string;
  model?: string;
  year?: string;
};

const modelOptions = (brand: string | undefined, models: string[]) =>
  [undefined, ...models.sort()].map((model) => ({
    name: model ?? "Kaikki mallit",
    value: model ? `${brand} ${model}` : `${brand}`,
  }));

const yearOptions = (years: string[]) =>
  [undefined, ...years].map((year) => ({
    name: year ?? "Kaikki käyttöönottovuodet",
    value: year ?? "0",
  }));

export const Selector = ({ onChange, brand, model, year }: Props) => {
  const brands = getBrands();
  const brandOptions = brands.map((b) => ({
    name: b,
    value: b,
  }));

  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(brand);
  const [models, setModels] = useState<string[]>(brand ? getModels(brand) : []);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(model);
  const [years, setYears] = useState<string[]>(model ? getYears(model) : []);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(year);

  useEffect(() => {
    if (selectedBrand) {
      setModels(getModels(selectedBrand));
    }
  }, [selectedBrand]);

  useEffect(() => {
    if (selectedModel) {
      setYears(getYears(selectedModel));
    }
  }, [selectedModel]);

  return (
    <div>
      <SelectSearch
        options={brandOptions}
        placeholder="Valitse merkki"
        search={true}
        filterOptions={(opts) => (query: string) =>
          opts.filter((o) =>
            o.name.toLowerCase().includes(query.toLowerCase())
          )}
        onChange={(val) => setSelectedBrand(val.toString())}
        value={selectedBrand}
      />
      <SelectSearch
        options={modelOptions(selectedBrand, models)}
        placeholder="Valitse malli"
        search={true}
        filterOptions={(opts) => (query: string) =>
          opts.filter((o) =>
            o.name.toLowerCase().includes(query.toLowerCase())
          )}
        onChange={(val) => setSelectedModel(val.toString())}
        value={selectedModel}
      />
      <SelectSearch
        options={yearOptions(years)}
        placeholder="Valitse käyttöönottovuosi"
        onChange={(val) => setSelectedYear(val.toString())}
        value={selectedYear}
      />
      <button
        onClick={() =>
          onChange({
            brand: selectedBrand,
            model: selectedModel,
            year: selectedYear,
          })
        }
      >
        VALITSE
      </button>
    </div>
  );
};
