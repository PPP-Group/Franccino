@component('mail::message')
# Nova mensagem de contato

**Tipo:** {{ $contactMessage->type->label() }}
**Nome:** {{ $contactMessage->name }}
**E-mail:** {{ $contactMessage->email }}
@if($contactMessage->phone)
**Telefone:** {{ $contactMessage->phone }}
@endif
@if($contactMessage->company)
**Empresa:** {{ $contactMessage->company }}
@endif
@if($contactMessage->profession)
**Perfil:** {{ $contactMessage->profession->label() }}
@endif
@if($contactMessage->city || $contactMessage->state)
**Local:** {{ trim(($contactMessage->city ?? '').(($contactMessage->city && $contactMessage->state) ? ' - ' : '').($contactMessage->state ?? '')) }}
@endif

**Mensagem:**

{{ $contactMessage->message }}

@if(count($items) > 0)
## Itens

@foreach($items as $item)
- **{{ $item['product'] ?? 'Produto removido' }}** — Quantidade: {{ $item['quantity'] }}
@if(!empty($item['finishes']))
  Acabamentos: {{ collect($item['finishes'])->map(fn ($finish) => $finish['name'].($finish['code'] ? " ({$finish['code']})" : ''))->join(', ') }}
@endif
@if(!empty($item['note']))
  Observação: {{ $item['note'] }}
@endif
@endforeach
@endif

@if($contactMessage->source_url)
Enviado a partir de: {{ $contactMessage->source_url }}
@endif

@component('mail::button', ['url' => $panelUrl])
Ver no painel
@endcomponent
@endcomponent
