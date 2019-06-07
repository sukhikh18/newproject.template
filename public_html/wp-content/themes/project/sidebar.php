<?php
/**
 * Второстепенный столбец
 *
 * Вызывается командой get_sidebar()
 * Он используется для добавления как правило бокового столбца
 *
 * @see https://developer.wordpress.org/themes/basics/template-hierarchy/
 * @package project
 * @version 1.0
 */

dynamic_sidebar( is_show_sidebar() );
