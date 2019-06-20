<?php

use NikolayS93\PHPMailInterface;

// @note fix path to Composer's autoloader
require __DIR__ . '/../../vendor/autoload.php';

/** @var bool  must be empty for spam filter */
$is_spam = !empty($_POST["surname"]);
if( $is_spam ) { header($_SERVER['SERVER_PROTOCOL'] . ' 403 Forbidden', true, 403); die(); }

$Maili = PHPMailInterface::getInstance( true );

/**
 * User Name who sent message: %s <no-reply@domain.ltd>
 */
$Maili->fromName = 'Администратор сайта';

/**
 * Mail subject
 */
$Maili->Subject = 'Сообщение с сайта';

/**
 * Address where to send the message
 */
$Maili->addAddress('izh-host@ya.ru');

/**
 * Mail carbon copy
 */
$Maili->addCC('trashmailsizh@ya.ru');

/**
 * Add new field
 * @param $key
 * @param $fieldName
 */
$Maili->addField( 'advanced', 'Тестовое поле', 'validateAdvanced' );
function validateAdvanced( $value, $fieldname ) {
    $Maili = PHPMailInterface::getInstance();

    if( strlen($value) < 10 ) {
        $Maili->addError("Поле \"$fieldname\" должно содержать не менее 10 символов.");
    }

    return "\r\n" . $fieldname;
}

/**
 * Field with this key must be filled
 */
$Maili->setRequired('your-phone');
$Maili->setRequired('advanced');

/**
 * @var array List field key => sanitized requested value
 */
$fields = $Maili->getFields();

/**
 * @var array List field key => field name (title/label)
 */
$fieldNames = $Maili->getFieldNames();

/**
 * Message is HTML
 */
// $Maili->isHTML(true);

/**
 * Collect information on email body
 */
foreach ($fields as $key => $value)
{
    if( $value ) $Maili->Body.= $fieldNames[$key] . ": $value\r\n";
}

/**
 * Technical additional information
 */
if( $Maili->Body ) {
    $Maili->Body.= "\r\n";
    $Maili->Body.= "URI запроса: ". $_SERVER['REQUEST_URI'] . "\r\n";
    $Maili->Body.= "URL источника запроса: ". str_replace($Maili::$protocol . ':', '', $_SERVER['HTTP_REFERER']) . "\r\n";
}

$Maili->sendMail();
$Maili->showResult();
