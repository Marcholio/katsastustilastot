import React, { useState } from "react";
import { getTopList, getTopListByBrand } from "./backend/backend";

const Table = () => {
  const topList = getTopList();
  const topListByBrands = getTopListByBrand();

  const [showBrands, setShowBrands] = useState(false);

  return (
    <div className={"statistics"}>
      <h1>Tilastot</h1>
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
              <th>{showBrands ? "Merkki" : "Malli"}</th>
              <th className="align-right">Pisteet</th>
            </tr>
          </thead>
          <tbody>
            {(showBrands ? topListByBrands : topList).map((l) => (
              <tr key={l[0]}>
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
