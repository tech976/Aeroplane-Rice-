import { Img, Notch } from './ui';

/** Two campaign photographs from the October 2026 shoot: the range on the shelf, and it cooked. */
export function Campaign() {
  return (
    <section className="campaign light" id="campaign">
      <div className="wrap">
        <div className="head">
          <h2 className="display">The whole kitchen, one name.</h2>
          <p className="lede">Rice, atta, maida, sooji, besan, salt and sugar. The same mill, the same checks.</p>
        </div>

        <div className="campaign__grid">
          <figure className="campaign__shot frame">
            <Notch icon="sack" />
            <Img name="campaign-shelf" alt="Aeroplane atta, sugar, sooji, maida, besan and salt on a shelf above two La-Taste basmati packs" sizes="(min-width: 900px) 38vw, 100vw" />
          </figure>
          <figure className="campaign__shot frame">
            <Notch icon="handi" />
            <Img name="campaign-pot" alt="The Aeroplane range beside a pot of cooked basmati pulao" sizes="(min-width: 900px) 54vw, 100vw" />
          </figure>
        </div>
      </div>
    </section>
  );
}
