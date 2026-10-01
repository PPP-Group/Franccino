<?php

use App\Support\WordPress\DimensionParser;

it('reads labelled measures in millimetres', function () {
    expect(DimensionParser::parse('600L X 600P X 750A'))->toBe([
        'width' => 600, 'depth' => 600, 'height' => 750, 'seat_height' => null, 'diameter' => null,
    ]);
    expect(DimensionParser::parse('870L x 830P x 780H (mm)'))->toMatchArray(['width' => 870, 'depth' => 830, 'height' => 780]);
});

it('converts centimetres, decimal commas and diameters to millimetres', function () {
    expect(DimensionParser::parse('67L x 55,5P x 80A (cm)'))->toMatchArray(['width' => 670, 'depth' => 555, 'height' => 800]);
    expect(DimensionParser::parse('110Ø x 74,5A (cm)'))->toMatchArray(['diameter' => 1100, 'height' => 745, 'width' => null]);
});

it('reads unlabelled values as width, depth and height, and the seat height', function () {
    expect(DimensionParser::parse('80 x 50 x 50h'))->toMatchArray(['width' => 800, 'depth' => 500, 'height' => 500]);
    expect(DimensionParser::parse('43 x 54 x 106hx70 ASS(cm)'))->toMatchArray(['width' => 430, 'height' => 1060, 'seat_height' => 700]);
});

it('guesses the unit only from the size of the numbers when the text has none', function () {
    expect(DimensionParser::parse('60L x 35P'))->toMatchArray(['width' => 600, 'depth' => 350]);
    expect(DimensionParser::parse('3000L x 3000P x 2800A'))->toMatchArray(['width' => 3000, 'height' => 2800]);
});

it('returns null for ranges, repeated axes and text without numbers', function () {
    expect(DimensionParser::parse('400 a 750D x 400 a 650H (mm)'))->toBeNull()
        ->and(DimensionParser::parse('1800 a 3000L x 800P'))->toBeNull()
        ->and(DimensionParser::parse('Verifique com uma de nossas consultoras.'))->toBeNull()
        ->and(DimensionParser::parse('60L x 70L'))->toBeNull()
        ->and(DimensionParser::parse(''))->toBeNull();
});
