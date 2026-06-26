
-- Public read policies for demo
CREATE POLICY "public_read_marcas" ON marcas FOR SELECT USING (true);
CREATE POLICY "public_read_prendas" ON prendas FOR SELECT USING (true);
CREATE POLICY "public_read_outfits" ON outfits FOR SELECT USING (true);
CREATE POLICY "public_read_outfit_items" ON outfit_items FOR SELECT USING (true);
CREATE POLICY "public_read_perfiles" ON perfiles FOR SELECT USING (true);
CREATE POLICY "public_read_outfit_likes" ON outfit_likes FOR SELECT USING (true);
CREATE POLICY "public_read_outfits_guardados" ON outfits_guardados FOR SELECT USING (true);
