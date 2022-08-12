import React, { useState } from "react";
import { getTopList, getTopListByBrand } from "./backend/backend";

const Table = () => {
  const topList = getTopList();
  const topListByBrands = getTopListByBrand();

  const [showBrands, setShowBrands] = useState(false);

  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className={"statistics"}>
      <h1>Tilastot</h1>
      <div style={{ padding: "1rem" }}>
        <span onClick={() => setShowInstructions(!showInstructions)}>
          {showInstructions ? "Piilota ohjeet" : "Näytä ohjeet"}
        </span>
      </div>
      {showInstructions && (
        <div className="instructions">
          <p>
            Tilastossa voit vertailla kaikkia aineiston merkkejä ja malleja.
          </p>
          <p>
            Taulukossa kukin merkki ja malli on pisteytetty sen mukaan, kuinka
            paljon keskimääräistä autoa parempi se keskimäärin on. Esimerkiksi,
            jos keskimääräisen 100tkm ajetun auton hylkäysprosentti on 9.8%, ja
            vertailtavan auton vastaava hylkäysprosentti on 5.2% saa se 4.6
            pistettä.
          </p>
          <p>
            Kaikista pisteistä lasketaan keskiarvo, jolloin esimerkiksi -10
            kokonaispistettä tarkoittaa, että kyseisen auton hylkäysprosentti on
            keskimäärin 10 prosenttiyksikköä huonompi, kuin keskimääräisellä
            autolla.
          </p>
        </div>
      )}
      <button
        className={"table-button"}
        onClick={() => setShowBrands(!showBrands)}
      >
        Näytä {showBrands ? "mallit" : "merkit"}
      </button>
      <div className="table-container">
        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>{showBrands ? "Merkki" : "Malli"}</th>
              <th className="align-right">Pisteet</th>
            </tr>
          </thead>
          <tbody>
            {(showBrands ? topListByBrands : topList).map((l, i) => (
              <tr key={l[0]}>
                <td>{i + 1}.</td>
                <td>{l[0]}</td>
                <td className="align-right">{l[1].toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
