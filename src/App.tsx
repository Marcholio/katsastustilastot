import React, { useEffect, useState } from "react";
import { getModels, getYears } from "./backend/backend";
import SelectSearch from "react-select-search";

import "react-select-search/style.css";
import "./App.css";
import { Chart } from "./chart";

function App() {
  const models = getModels();
  const modelOptions = models.map((model) => ({
    name: model,
    value: model,
  }));

  const [model, setModel] = useState<string | undefined>(undefined);
  const [years, setYears] = useState<string[]>([]);
  const [carYear, setCarYear] = useState<string | undefined>(undefined);

  const yearOptions = [...years, undefined].map((year) => ({
    name: year ?? "Kaikki käyttöönottovuodet",
    value: year ?? 0,
  }));

  useEffect(() => {
    if (model) {
      setYears(getYears(model));
    }
  }, [model]);

  return (
    <div className="App">
      <SelectSearch
        options={modelOptions}
        placeholder="Valitse automalli"
        search={true}
        filterOptions={(opts) => (query: string) =>
          opts.filter((o) =>
            o.name.toLowerCase().includes(query.toLowerCase())
          )}
        onChange={(val) => {
          setModel(val.toString());
          setCarYear(undefined);
        }}
        value={model}
      />
      <SelectSearch
        options={yearOptions}
        placeholder="Valitse käyttöönottovuosi"
        onChange={(val) => setCarYear(val.toString())}
        value={carYear}
      />
      <h1>
        {model ?? ""} {carYear && carYear !== "0" ? carYear : ""}
      </h1>
      {model && <Chart model={model} year={carYear} />}
    </div>
  );
}

export default App;
