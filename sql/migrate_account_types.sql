-- ---------------------------------------------------------------------------
-- Collapse the three-tier account model down to two.
--
--   antes:  enum('Free','Premium','Admin')
--   ahora:  enum('User','Admin')
--
-- Also removes the billing tables that only existed to model subscriptions
-- (`pagos`, `suscripciones`) and the wallet balance on `usuario.saldo`. None of
-- them are referenced by any API route or client code.
--
-- Safe to run more than once.
-- ---------------------------------------------------------------------------

-- 1. Widen the enum so the rows we are about to rewrite stay valid. MySQL and
--    MariaDB both coerce out-of-range enum values to '' rather than rejecting
--    the UPDATE, which would silently turn every account into an empty string.
ALTER TABLE `usuario`
  MODIFY `tipo_cuenta` enum('Free','Premium','User','Admin') DEFAULT 'User';

-- 2. Both former tiers become a plain User. Admins are untouched.
UPDATE `usuario`
   SET `tipo_cuenta` = 'User'
 WHERE `tipo_cuenta` IN ('Free', 'Premium');

-- 3. Narrow the enum to the two roles the app actually has.
ALTER TABLE `usuario`
  MODIFY `tipo_cuenta` enum('User','Admin') DEFAULT 'User';

-- 4. Drop the billing model. `pagos` references `suscripciones`, so it has to
--    go first.
DROP TABLE IF EXISTS `pagos`;
DROP TABLE IF EXISTS `suscripciones`;

-- 5. Drop the wallet balance that only made sense alongside them.
ALTER TABLE `usuario`
  DROP COLUMN IF EXISTS `saldo`;

-- 6. The seeded demo account was literally called "premium". Rename it so
--    nothing in the app still reads as a paid tier. Guarded so it is a no-op if
--    `user@email.com` is already taken.
UPDATE `usuario`
   SET `nombre` = 'Sara Mendoza',
       `email` = 'user@email.com',
       `tipo_cuenta` = 'User',
       `pais` = NULLIF(`pais`, 'Desconocido')
 WHERE `email` = 'premium@email.com'
   AND NOT EXISTS (
     SELECT 1 FROM (SELECT `email` FROM `usuario`) AS taken
      WHERE taken.`email` = 'user@email.com'
   );

SELECT `tipo_cuenta`, COUNT(*) AS `usuarios`
  FROM `usuario`
 GROUP BY `tipo_cuenta`;
