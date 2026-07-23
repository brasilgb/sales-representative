@php
    $isPublicCatalog = data_get($page, 'component') === 'site/catalogs/show';
    $catalogCompany = data_get($page, 'props.company.name', 'VetorPet');
    $catalogLogo = data_get($page, 'props.company.logo_url');
    $pageTitle = $isPublicCatalog ? "Catálogo de produtos | {$catalogCompany}" : 'VetorPet — Vendas de suprimentos para pet shops';
    $pageDescription = $isPublicCatalog
        ? "Consulte os produtos disponíveis no catálogo da {$catalogCompany}."
        : 'Organize clientes, catálogo, visitas, pedidos e equipe comercial do mercado pet.';
    $pageUrl = $isPublicCatalog ? request()->fullUrl() : config('app.url');
    $shareImage = $catalogLogo ?: asset('images/logo.png');
@endphp

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="description" content="{{ $pageDescription }}">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ $isPublicCatalog ? $catalogCompany : 'VetorPet' }}">
        <meta property="og:title" content="{{ $pageTitle }}">
        <meta property="og:description" content="{{ $pageDescription }}">
        <meta property="og:url" content="{{ $pageUrl }}">
        <meta property="og:image" content="{{ $shareImage }}">
        <meta property="og:image:secure_url" content="{{ $shareImage }}">
        <meta property="og:image:alt" content="Logo {{ $isPublicCatalog ? $catalogCompany : 'VetorPet' }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $pageTitle }}">
        <meta name="twitter:description" content="{{ $pageDescription }}">
        <meta name="twitter:image" content="{{ $shareImage }}">
        <link rel="canonical" href="{{ $pageUrl }}">

        <style>
            html {
                background-color: oklch(1 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'VetorPet') }}</title>

        <link rel="icon" type="image/png" href="/images/logo_pet.png">
        <link rel="shortcut icon" href="/favicon.ico" sizes="any">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
