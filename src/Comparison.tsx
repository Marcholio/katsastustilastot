import React, { useState } from "react";

import "react-select-search/style.css";
import { Chart } from "./chart";
import { Selector } from "./Selector";

type SelectedCar = {
  brand?: string;
  model?: string;
  year?: string;
};

function Comparison() {
  const [right, setRight] = useState<SelectedCar>({
    brand: undefined,
    model: undefined,
    year: undefined,
  });

  const [left, setLeft] = useState<SelectedCar>({
    brand: undefined,
    model: undefined,
    year: undefined,
  });

  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="comparison">
      <h1>Vertailu</h1>
      <span onClick={() => setShowInstructions(!showInstructions)}>
        {showInstructions ? "Piilota ohjeet" : "Näytä ohjeet"}
      </span>
      {showInstructions && (
        <div className="instructions">
          <p>
            Valitse vertaltavat automerkit. Voit myös tarkentaa valitsemalla
            tietyn mallin ja tietyn käyttöönottovuoden.
          </p>
          <p>
            Kuvaaja näyttää keskimääräisen auton hylkäysprosentin kehittymisen
            ajokilometrien kertyessä (tumma viiva). Lisäksi on kuvattu paras ja
            huonoin neljännes (tumma katkoviiva).
          </p>
          <p>
            Vertailtavat autot näytetään kuvaajassa pisteinä. Mikäli piste on
            tumman viivan alapuolella, on valittu auto keskimääräistä autoa
            parempi ja vastaavasti viivan yläpuolella olevat autot vikaantuvat
            keskimääräistä useammin.
          </p>
        </div>
      )}
      <div className="selectors">
        <Selector
          brand={left.brand}
          model={left.model}
          year={left.year}
          onChange={(val) => setLeft(val)}
        />
        <h1>vs.</h1>
        <Selector
          brand={right.brand}
          model={right.model}
          year={right.year}
          onChange={(val) => setRight(val)}
        />
      </div>
      {left.model && (
        <Chart
          left={{ model: left.model, year: left.year }}
          right={
            right.model ? { model: right.model, year: right.year } : undefined
          }
        />
      )}
    </div>
  );
}

export default Comparison;
