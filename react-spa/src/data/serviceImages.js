import smesitel from '../images/smesitel.webp'
import unitaz from '../images/unitaz.webp'
import razvodkatrub from '../images/razvodkatrub.webp'
import sushitel from '../images/sushitel.webp'
import provodka from '../images/provodka.webp'
import rozetka from '../images/rozetka.webp'
import elecktroshit from '../images/elecktroshit.webp'
import oboi from '../images/oboi.webp'
import shtukaturka from '../images/shtukaturka.webp'
import pokraska from '../images/pokraska.webp'
import ukladka_plitki from '../images/ukladka_plitki.webp'
import zatirka from '../images/zatirka.webp'
import potolok from '../images/potolok.webp'
import lyustra from '../images/lyustra.webp'
import shkaf from '../images/shkaf.jpg'
import kuhn from '../images/kuhonniy_garnitur.webp'

export const serviceImages = {
  'Замена смесителя': smesitel,
  'Установка унитаза': unitaz,
  'Разводка труб': razvodkatrub,
  'Монтаж полотенцесушителя': sushitel,
  'Замена проводки': provodka,
  'Установка розеток': rozetka,
  'Монтаж щитка': elecktroshit,
  'Поклейка обоев': oboi,
  'Штукатурка стен': shtukaturka,
  'Покраска стен': pokraska,
  'Укладка плитки': ukladka_plitki,
  'Затирка швов': zatirka,
  'Монтаж натяжного потолка': potolok,
  'Люстра под ключ': lyustra,
  'Сборка шкафа-купе': shkaf,
  'Сборка кухни': kuhn,
}

export function getServiceImage(service) {
  return serviceImages[service.service_name] || null
}
