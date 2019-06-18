<?php

use NikolayS93\PHPMailInterface;

// @note fix path to Composer's autoloader
require __DIR__ . '/../../vendor/autoload.php';

/** @var bool  must be empty for spam filter */
$is_spam = !empty($_POST["surname"]);
if( $is_spam ) { header($_SERVER['SERVER_PROTOCOL'] . ' 403 Forbidden', true, 403); die(); }

$MailI = new PHPMailInterface();

/**
 * User Name who sent message: %s <no-reply@domain.ltd>
 */
$MailI->fromName = 'Администратор';

/**
 * Mail subject
 */
$MailI->Subject = 'Сообщение с сайта';

/**
 * Address where to send the message
 */
$MailI->addAddress('izh-host@ya.ru');

/**
 * Mail carbon copy
 */
$MailI->addCC('trashmailsizh@yandex.ru');

$this->addField('your-org',  'Организация');

/**
 * Field with this key must be filled
 */
$MailI->setRequired('your-phone');

/**
 * @var array List field key => sanitized requested value
 */
$fields = $MailI->getFields();

/**
 * @var array List field key => field name (title/label)
 */
$fieldNames = $MailI->getFieldNames();

/**
 * Message is HTML
 */
// $MailI->isHTML(true);

$MailI->Body = 'Вы получили это письмо, потому что на вашем сайте кто то оставил заявку:' . "\r\n\r\n";

/**
 * Collect information on email body
 */
foreach ($fields as $key => $value)
{
    if( $value ) $MailI->Body.= $fieldNames[$key] . ": $value\r\n";
}

/**
 * Technical additional information
 */
if( $MailI->Body ) {
    $MailI->Body.= "\r\n";
    $MailI->Body.= "URI запроса: ". $_SERVER['REQUEST_URI'] . "\r\n";
    $MailI->Body.= "URL источника запроса: ". str_replace($MailI::$protocol . ':', '', $_SERVER['HTTP_REFERER']) . "\r\n";
}

$MailI->sendMail();
$MailI->showResult();