import type { Item } from '@shared/models';

export function buildItemPopupHtml(item: Item, categoryName: string): string {
  const photoUrl = item.photos?.[0]?.url;

  return `
    <div class="item-link" data-item-id="${item.id}">
      ${photoUrl ? `<img src="${photoUrl}" alt="${item.name}" style="width:100%;height:110px;object-fit:cover;display:block" />` : ''}
      <div style="padding:14px 16px 12px">
        <strong style="font-size:15px">${item.name}</strong>
        <div style="font-size:12px;color:#666;margin-top:4px">
          ${item.year}
          ${categoryName ? `<span style="margin-left:6px">· ${categoryName}</span>` : ''}
        </div>
        <div style="margin-top:12px">
          <span style="display:block;text-align:center;padding:7px 0;font-size:12px;font-weight:500;color:#2563eb;background:#eff6ff;border-radius:6px">View details</span>
        </div>
      </div>
    </div>
  `;
}
