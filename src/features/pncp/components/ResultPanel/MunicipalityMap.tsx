import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import type { ItemPorMunicipio } from '../../types'
import { MUNICIPIO_COORDS } from './municipioCoords'
import styles from './MunicipalityMap.module.css'

interface MunicipalityMapProps {
  municipios: ItemPorMunicipio[]
  medianaNacional: number
}

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const PARA_CENTER: [number, number] = [-3.5, -51.5]

export function MunicipalityMap({ municipios, medianaNacional }: MunicipalityMapProps) {
  const withCoords = municipios
    .map(m => ({ ...m, coords: MUNICIPIO_COORDS[m.municipio] }))
    .filter(m => m.coords !== undefined)

  const maxN = Math.max(...municipios.map(m => m.n), 1)

  function markerColor(mediana: number): string {
    return mediana > medianaNacional ? '#DC2626' : '#27AE60'
  }

  function markerRadius(n: number): number {
    return 6 + (n / maxN) * 14
  }

  return (
    <div className={styles.wrap}>
      <MapContainer
        center={PARA_CENTER}
        zoom={5}
        className={styles.map}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {withCoords.map(m => (
          <CircleMarker
            key={m.municipio}
            center={m.coords}
            radius={markerRadius(m.n)}
            pathOptions={{
              fillColor:   markerColor(m.mediana),
              fillOpacity: 0.82,
              color: '#fff',
              weight: 2,
            }}
          >
            <Popup className={styles.popup}>
              <div className={styles.popupContent}>
                <strong>{m.municipio}</strong>
                <div className={styles.popupPrice}>{fmtBRL(m.mediana)}</div>
                <div className={styles.popupRange}>
                  {fmtBRL(m.min)} – {fmtBRL(m.max)}
                </div>
                <div className={styles.popupOcorr}>{m.n} ocorrência{m.n !== 1 ? 's' : ''}</div>
                <div
                  className={styles.popupDelta}
                  style={{ color: m.mediana > medianaNacional ? '#DC2626' : '#27AE60' }}
                >
                  {m.mediana > medianaNacional ? '▲' : '▼'}{' '}
                  {Math.abs((m.mediana - medianaNacional) / medianaNacional * 100).toFixed(1)}% da mediana
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {withCoords.length < municipios.length && (
        <p className={styles.note}>
          {municipios.length - withCoords.length} município{municipios.length - withCoords.length !== 1 ? 's' : ''} sem coordenadas disponíveis não aparece{municipios.length - withCoords.length !== 1 ? 'm' : ''} no mapa.
        </p>
      )}

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#27AE60' }} />
          Abaixo da mediana
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#DC2626' }} />
          Acima da mediana
        </div>
        <div className={styles.legendNote}>Tamanho = nº de ocorrências</div>
      </div>
    </div>
  )
}
