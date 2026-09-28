@component('mail::message')
# {{ __('New contact message') }}

**{{ __('Type') }}:** {{ $contactMessage->type->label() }}
**{{ __('Name') }}:** {{ $contactMessage->name }}
**{{ __('Email') }}:** {{ $contactMessage->email }}
@if($contactMessage->phone)
**{{ __('Phone') }}:** {{ $contactMessage->phone }}
@endif
@if($contactMessage->company)
**{{ __('Company') }}:** {{ $contactMessage->company }}
@endif
@if($contactMessage->profession)
**{{ __('Profession') }}:** {{ $contactMessage->profession->label() }}
@endif
@if($contactMessage->city || $contactMessage->state)
**{{ __('Location') }}:** {{ trim(($contactMessage->city ?? '').(($contactMessage->city && $contactMessage->state) ? ' - ' : '').($contactMessage->state ?? '')) }}
@endif
@if($product)
**{{ __('Product') }}:** {{ $product }}
@endif
**{{ __('Language') }}:** {{ $contactMessage->locale }}

**{{ __('Message') }}:**

{{ $contactMessage->message }}

@if(count($items) > 0)
## {{ __('Items') }}

@foreach($items as $item)
- **{{ $item['product'] }}** — {{ __('Quantity') }}: {{ $item['quantity'] }}
@if(!empty($item['finishes']))
  {{ __('Finishes') }}: {{ collect($item['finishes'])->map(fn ($finish) => $finish['name'].($finish['code'] ? " ({$finish['code']})" : ''))->join(', ') }}
@endif
@if(!empty($item['note']))
  {{ __('Note') }}: {{ $item['note'] }}
@endif
@endforeach
@endif

@if($contactMessage->source_url)
{{ __('Sent from') }}: {{ $contactMessage->source_url }}
@endif

@component('mail::button', ['url' => $panelUrl])
{{ __('View in panel') }}
@endcomponent
@endcomponent
