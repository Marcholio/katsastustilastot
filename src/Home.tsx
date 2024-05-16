const Home = () => {
  document.title = 'Katsastustilastot | Löydä luotettavin automalli'

  return (
    <div className="home">
      <h1>Katsastustilastot</h1>
      <div>
        <p>
          Automerkkien ja -mallien ympärillä käydään loputonta keskustelua eri
          mallien paremmuudesta. Yhden mielestä Opelilla ei kannata haaveilla
          huolettomista kilometreistä, toinen taas pitää Volkswagenia paholaisen
          keksintönä.
        </p>
        <p>
          Mutta mitä sanoo faktat? Mitkä automerkit ja -mallit kestävät
          parhaiten vuodesta toiseen ja minkä kanssa katsastus nostattaa pulssia
          joka kerta? Tällä työkalulla vertailu eri merkkien ja mallien välillä
          käy käden käänteessä. Keskustelua tuskin saadaan päättymään, mutta
          ainakin sen tueksi voidaan tuoda kylmiä tilastoja.
        </p>

        <h2>Aineisto</h2>
        <p>
          Vertailu perustuu{' '}
          <a
            href="https://trafi2.stat.fi/PXWeb/pxweb/fi/TraFi/TraFi__Katsastuksen_vikatilastot/?tablelist=true"
            target="_blank"
            rel="noreferrer"
          >
            Trafin julkaisemaan avoimeen dataan
          </a>
          . Aineisto sisältää vuosina 2017 - 2023 katsastetut, katsastushetkellä
          alle 15v. vanhat autot. Vertailu ei siis ole täydellinen vanhempien
          autojen osalta, mutta antaa kuitenkin hyvän käsityksen eri mallien
          luotettavuudesta.
        </p>
      </div>
      <div className="cta-container">
        <a className="cta-button" href="#/vertailu">
          Vertailuun &gt;
        </a>
      </div>
    </div>
  )
}

export default Home
