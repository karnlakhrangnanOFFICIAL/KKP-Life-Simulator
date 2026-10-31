import React from 'react';
import { ASSETS_DATABASE, AssetManager } from '../core/asset_manager';
import { PlayerData } from '../engine/types';
import { Home, Car, AlertCircle, Trash2 } from 'lucide-react';

interface AssetMarketViewProps {
  player: PlayerData;
  onPurchaseAsset: (assetId: string) => void;
  onSellOrCancelAsset: (assetId: string) => void;
}

export const AssetMarketView: React.FC<AssetMarketViewProps> = ({
  player,
  onPurchaseAsset,
  onSellOrCancelAsset,
}) => {
  const netLiquidation = AssetManager.getNetAssetLiquidationValue(player);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            ซื้อบ้าน ผ่อนรถ และจัดการทรัพย์สิน
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
            ที่อยู่อาศัยที่ดีช่วยเพิ่มความสุขรายปี ส่วนยานพาหนะช่วยประหยัดพลังงานเดินทางไปทำงาน แต่ระวังอย่าขาดส่งค่างวดติดกัน 2 ปี เพราะจะถูกไฟแนนซ์ยึดทรัพย์และติดเครดิตบูโร!
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 shrink-0 text-xs sm:text-sm font-mono-num space-y-1">
          <div className="text-slate-600 dark:text-slate-400 font-sans">
            ประวัติเครดิต:{' '}
            <span
              className={
                player.finance.credit_score === 'GOOD'
                  ? 'font-bold text-emerald-700 dark:text-emerald-400'
                  : 'font-bold text-rose-600 dark:text-rose-400'
              }
            >
              {player.finance.credit_score === 'GOOD'
                ? 'ปกติ (ยื่นกู้ได้)'
                : `ติดเครดิตบูโร (เหลือ ${player.finance.credit_ban_years} ปี)`}
            </span>
          </div>
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            มูลค่าทรัพย์สินสุทธิ: {netLiquidation.toLocaleString()} บาท
          </div>
        </div>
      </div>

      {/* Owned Assets Portfolio */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
          ทรัพย์สินและสัญญาเช่าที่คุณถืออยู่ ({player.assets.length} รายการ)
        </div>

        {player.assets.length === 0 ? (
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 text-center">
            ยังไม่มีบ้านหรือรถในชื่อของตัวเอง (พักอาศัยอยู่กับครอบครัวหรือหอพักพื้นฐานตามค่าครองชีพ)
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {player.assets.map((owned) => (
              <div
                key={owned.asset_id}
                className={`p-5 rounded-xl border flex flex-col justify-between gap-4 ${
                  owned.default_count > 0
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/60'
                    : 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-500/50'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                    <span className="font-sans font-medium">
                      {owned.type === 'HOUSING' ? 'ที่อยู่อาศัย' : 'ยานพาหนะ'}
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {owned.is_rental
                        ? 'สัญญาเช่ารายปี'
                        : owned.remaining_years > 0
                        ? `เหลือผ่อนอีก ${owned.remaining_years} ปี`
                        : 'ผ่อนหมดแล้ว (เป็นเจ้าของ 100%)'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {owned.name}
                  </h4>

                  <div className="text-sm text-slate-600 dark:text-slate-400 font-mono-num">
                    {owned.remaining_years > 0
                      ? `ค่างวด ${owned.annual_installment.toLocaleString()} บ./ปี`
                      : 'ไม่มีภาระค่างวดแล้ว'}{' '}
                    {owned.annual_maintenance > 0
                      ? `· ค่าดูแลรักษา ${owned.annual_maintenance.toLocaleString()} บ./ปี`
                      : ''}
                  </div>

                  {owned.default_count > 0 && (
                    <div className="pt-1 flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>ค้างค่างวดแล้ว 1 ปี! หากขาดส่งซ้ำในปีหน้าจะถูกยึดทรัพย์ทันที</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono-num">
                    จ่ายสะสมแล้ว {owned.total_paid.toLocaleString()} บ.
                  </span>
                  <button
                    type="button"
                    onClick={() => onSellOrCancelAsset(owned.asset_id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{owned.is_rental ? 'ยกเลิกสัญญาเช่า' : 'ขายคืนตลาด'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asset Showroom Matrix */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
          รายการบ้าน คอนโด และยานพาหนะที่เปิดขาย/ให้เช่า
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ASSETS_DATABASE.map((def) => {
            const alreadyOwned = player.assets.some((a) => a.asset_id === def.asset_id);
            const check = AssetManager.checkPurchaseEligibility(player, def);

            return (
              <div
                key={def.asset_id}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {def.type === 'HOUSING' ? (
                      <Home className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Car className="w-4 h-4 text-sky-500" />
                    )}
                    <span className="font-medium">
                      {def.type === 'HOUSING' ? 'ที่อยู่อาศัย' : 'ยานพาหนะ'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num font-semibold text-slate-700 dark:text-slate-300">
                      {def.is_rental
                        ? `ค่าเช่า ${def.annual_installment.toLocaleString()} บ./ปี`
                        : def.installment_years === 0
                        ? `ซื้อเงินสด ${def.total_price.toLocaleString()} บ.`
                        : `ราคาเต็ม ${def.total_price.toLocaleString()} บ. (ผ่อน ${def.annual_installment.toLocaleString()} บ./ปี)`}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {def.name}
                  </h4>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {def.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-mono-num">
                    {def.is_rental
                      ? 'ไม่ต้องวางเงินดาวน์'
                      : `ใช้เงินก้อนแรก: ${def.down_payment.toLocaleString()} บ.`}
                  </div>

                  {alreadyOwned ? (
                    <span className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      มีอยู่แล้ว
                    </span>
                  ) : check.eligible ? (
                    <button
                      type="button"
                      onClick={() => onPurchaseAsset(def.asset_id)}
                      className="px-4 py-2 text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {def.is_rental
                        ? 'ทำสัญญาเช่า'
                        : def.installment_years === 0
                        ? 'ซื้อเงินสด'
                        : 'วางดาวน์ทำสัญญา'}
                    </button>
                  ) : (
                    <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-right">
                      {check.reason}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
